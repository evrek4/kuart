import fs from 'fs';
import path from 'path';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client from './r2';

interface UploadResult {
  url: string;
  key: string;
  size: number;
}

/**
 * Cloudflare R2 veya Yerel Disk Depolama Yardımcısı
 * Dosyayı öncelikle Cloudflare R2 CDN'e yükler; erişim veya ağ hatasında yerel ortama (public/uploads) kaydeder.
 */
export async function uploadMediaFile(
  file: Express.Multer.File,
  tenantId: string,
  subFolder: string = 'gallery'
): Promise<UploadResult> {
  const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;
  const r2Key = `${tenantId}/${subFolder}/${cleanFileName}`;

  const bucketName = process.env.R2_BUCKET_NAME || 'kuaforart';
  const publicCdnUrl = (process.env.R2_PUBLIC_URL || 'https://cdn.kuafor.art').replace(/\/$/, '');

  // 1. Cloudflare R2'ye Yükleme Denedik
  try {
    if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: r2Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const fileUrl = `${publicCdnUrl}/${r2Key}`;
      console.log(`[R2 Upload Success]: ${fileUrl}`);
      return {
        url: fileUrl,
        key: r2Key,
        size: file.size,
      };
    }
  } catch (err) {
    console.warn('[R2 Upload Warning] Cloudflare R2 yüklemesi başarısız, yerel disk yüklemesine geçiliyor:', err);
  }

  // 2. Yerel Disk Fallback (public/uploads/{tenantId}/{subFolder}/{filename})
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', tenantId, subFolder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilePath = path.join(uploadsDir, cleanFileName);
  fs.writeFileSync(localFilePath, file.buffer);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const localUrl = `${apiBase}/uploads/${tenantId}/${subFolder}/${cleanFileName}`;

  console.log(`[Local Upload Success]: ${localUrl}`);
  return {
    url: localUrl,
    key: `local/${tenantId}/${subFolder}/${cleanFileName}`,
    size: file.size,
  };
}

/**
 * Medya Dosyasını R2 veya Yerel Disken Silme Yardımcısı
 */
export async function deleteMediaFile(key: string): Promise<void> {
  try {
    if (key.startsWith('local/')) {
      const relativePath = key.replace(/^local\//, '');
      const localFilePath = path.join(process.cwd(), 'public', 'uploads', relativePath);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return;
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'kuaforart';
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (err) {
    console.error('[DeleteMediaFile Error]:', err);
  }
}
