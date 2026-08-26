/**
 * apps/api/src/services/storageService.ts
 *
 * Garbage Collection & Tenant Dosya Temizleme Servisi
 *
 * Görev: Bir Tenant silindiğinde;
 *   1. Cloudflare R2 CDN üzerindeki `{tenantId}/` prefix'li tüm objeleri sil
 *   2. Yerel disk üzerindeki `public/uploads/{tenantId}/` klasörünü sil
 *
 * Prensipler:
 *   - Non-blocking: Dosya silme hatası ana DB silme işlemini DURDURMAZ
 *   - Async: Büyük bucket'lar için sayfalandırılmış silme (ListObjectsV2 + DeleteObjects)
 *   - Audit log: Her adım loglanır
 */

import fs from 'fs';
import path from 'path';
import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
  ObjectIdentifier,
} from '@aws-sdk/client-s3';
import { r2Client } from '../lib/r2';

// ─────────────────────────────────────────────────────────────
// 1. CLOUDFLARE R2: Tenant Prefix Altındaki Tüm Dosyaları Sil
// ─────────────────────────────────────────────────────────────
async function deleteR2TenantObjects(tenantId: string): Promise<{ deleted: number; errors: number }> {
  const bucket = process.env.R2_BUCKET_NAME || 'kuaforart';
  const prefix = `${tenantId}/`;
  let deleted = 0;
  let errors = 0;
  let continuationToken: string | undefined;

  // R2 credentials yoksa pas geç
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.warn(`[StorageGC] R2 credentials tanımlı değil. R2 silme adımı atlanıyor. tenantId=${tenantId}`);
    return { deleted: 0, errors: 0 };
  }

  console.log(`[StorageGC] R2 silme başlıyor: bucket=${bucket}, prefix=${prefix}`);

  do {
    try {
      // Sayfa başına max 1000 obje listele
      const listResp = await r2Client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          MaxKeys: 1000,
          ContinuationToken: continuationToken,
        })
      );

      const objects: ObjectIdentifier[] = (listResp.Contents || []).map((obj) => ({
        Key: obj.Key!,
      }));

      if (objects.length === 0) {
        console.log(`[StorageGC] R2'de silinecek obje bulunamadı: prefix=${prefix}`);
        break;
      }

      // Toplu silme (max 1000 adet/istek)
      const deleteResp = await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects,
            Quiet: false,
          },
        })
      );

      deleted += deleteResp.Deleted?.length || 0;
      errors += deleteResp.Errors?.length || 0;

      if (deleteResp.Errors && deleteResp.Errors.length > 0) {
        deleteResp.Errors.forEach((e) =>
          console.warn(`[StorageGC] R2 Silme Hatası: key=${e.Key}, code=${e.Code}, msg=${e.Message}`)
        );
      }

      continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined;
    } catch (err: any) {
      console.error(`[StorageGC] R2 ListObjects/Delete hatası:`, err.message || err);
      errors++;
      break; // Sayfalama hatası varsa döngüden çık, ana silme işlemini bloke etme
    }
  } while (continuationToken);

  console.log(`[StorageGC] R2 silme tamamlandı: deleted=${deleted}, errors=${errors}, tenantId=${tenantId}`);
  return { deleted, errors };
}

// ─────────────────────────────────────────────────────────────
// 2. YEREL DİSK: public/uploads/{tenantId}/ Klasörünü Sil
// ─────────────────────────────────────────────────────────────
async function deleteLocalTenantDirectory(tenantId: string): Promise<{ deleted: boolean; error?: string }> {
  const uploadsBase = path.join(process.cwd(), 'public', 'uploads', tenantId);

  try {
    if (!fs.existsSync(uploadsBase)) {
      console.log(`[StorageGC] Yerel klasör bulunamadı (zaten yok): ${uploadsBase}`);
      // Hata değil — klasör hiç oluşturulmamış olabilir (fotoğraf yüklemeyen tenant)
      return { deleted: false };
    }

    // Node.js 14.14+ recursive rmdir / rm
    fs.rmSync(uploadsBase, { recursive: true, force: true });
    console.log(`[StorageGC] Yerel klasör silindi: ${uploadsBase}`);
    return { deleted: true };
  } catch (err: any) {
    // Non-blocking: hatayı logla ama exception'ı yukarıya fırlat
    console.error(`[StorageGC] Yerel klasör silme hatası: ${uploadsBase}`, err.message || err);
    return { deleted: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. ANA FONKSİYON: deleteTenantStorage
//    Admin route'dan çağrılır — DB delete'ten ÖNCE veya SONRA
//    (Hata olsa bile DB işlemini durdurmaz)
// ─────────────────────────────────────────────────────────────
export async function deleteTenantStorage(tenantId: string): Promise<void> {
  console.log(`[StorageGC] Tenant depolama temizliği başlatılıyor: tenantId=${tenantId}`);

  // Her iki silme işlemini paralel başlat (biri hata verse diğeri devam eder)
  const [r2Result, localResult] = await Promise.allSettled([
    deleteR2TenantObjects(tenantId),
    deleteLocalTenantDirectory(tenantId),
  ]);

  if (r2Result.status === 'rejected') {
    console.error(`[StorageGC] R2 silme beklenmedik hata:`, r2Result.reason);
  }

  if (localResult.status === 'rejected') {
    console.error(`[StorageGC] Yerel disk silme beklenmedik hata:`, localResult.reason);
  }

  console.log(`[StorageGC] Tenant depolama temizliği tamamlandı: tenantId=${tenantId}`, {
    r2: r2Result.status === 'fulfilled' ? r2Result.value : 'FAILED',
    local: localResult.status === 'fulfilled' ? localResult.value : 'FAILED',
  });

  // NOT: Bu fonksiyon HİÇBİR ZAMAN exception fırlatmaz.
  // Tüm hatalar loglanır ve zincir devam eder.
}