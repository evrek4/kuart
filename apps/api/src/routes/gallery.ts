import { Router, Response } from 'express';
import multer from 'multer';
import { prisma, getTenantPrisma } from '@kuafor-art/database';
import { ApiResponse } from '@kuafor-art/shared-types';
import { requireTenant, TenantRequest } from '../middlewares/tenant';
import { uploadMediaFile, deleteMediaFile } from '../lib/uploadHelper';

const router = Router();

// Multer in-memory storage (5MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları (JPEG, PNG, WEBP) yüklenebilir.'));
    }
  },
});

// GET /api/gallery - Tenant medyasını ve kapasitesini getir
router.get('/', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const galleryList = await tenantPrisma.media.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const mediaAggregation = await tenantPrisma.media.aggregate({
      where: { tenantId },
      _sum: { fileSize: true },
    });

    const usedBytes = Number(mediaAggregation._sum.fileSize ?? 0);
    const maxCapacity = Number(req.tenant!.mediaCapacity ?? 104857600);

    return res.json({
      success: true,
      data: {
        gallery: galleryList.map((m: any) => ({
          id: m.id,
          url: m.url,
          name: m.fileName || 'Fotoğraf',
          fileSize: Number(m.fileSize),
        })),
        capacity: {
          usedBytes,
          maxCapacity,
          availableBytes: Math.max(0, maxCapacity - usedBytes),
        },
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Gallery GET] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Galeri yüklenirken hata oluştu.' },
    } as ApiResponse);
  }
});

// POST /api/gallery - Fotoğraf Yükle (Multer + Cloudflare R2 / Local)
router.post('/', requireTenant, upload.single('file'), async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'Yüklenecek bir dosya seçilmedi.' },
      } as ApiResponse);
    }

    // Kota kontrolü
    const mediaAggregation = await tenantPrisma.media.aggregate({
      where: { tenantId },
      _sum: { fileSize: true },
    });

    const usedBytes = Number(mediaAggregation._sum.fileSize ?? 0);
    const maxCapacity = Number(req.tenant!.mediaCapacity ?? 104857600);

    if (usedBytes + file.size > maxCapacity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CAPACITY_EXCEEDED',
          message: 'Depolama alanınız bu dosyayı yüklemek için yetersiz. Lütfen eski fotoğrafları silin veya paketinizi yükseltin.',
        },
      } as ApiResponse);
    }

    // Cloudflare R2 veya Yerel Diske Yükle
    const uploadResult = await uploadMediaFile(file, tenantId, 'gallery');

    // DB'ye kaydet
    const mediaRecord = await tenantPrisma.media.create({
      data: {
        tenantId,
        url: uploadResult.url,
        fileName: file.originalname,
        fileSize: BigInt(file.size),
        fileType: file.mimetype,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Fotoğraf başarıyla yüklendi.',
      data: {
        id: mediaRecord.id,
        url: mediaRecord.url,
        name: mediaRecord.fileName,
        fileSize: Number(mediaRecord.fileSize),
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Gallery POST] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: error.message || 'Fotoğraf yüklenirken sunucu hatası oluştu.' },
    } as ApiResponse);
  }
});

// DELETE /api/gallery/:id - Fotoğraf Sil
router.delete('/:id', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { id } = req.params;

    const existingMedia = await tenantPrisma.media.findFirst({
      where: { id, tenantId },
    });

    if (!existingMedia) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Görsel bulunamadı.' },
      } as ApiResponse);
    }

    // Dosyayı depolamadan sil
    const r2Key = existingMedia.url.includes('cdn.kuafor.art/')
      ? existingMedia.url.split('cdn.kuafor.art/')[1]
      : existingMedia.url;
    await deleteMediaFile(r2Key);

    // DB'den sil
    await tenantPrisma.media.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Görsel silindi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Gallery DELETE] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_ERROR', message: 'Görsel silinirken hata oluştu.' },
    } as ApiResponse);
  }
});

// POST /api/gallery/:id/cover - Kapak Görseli Yap
router.post('/:id/cover', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { id } = req.params;

    const media = await tenantPrisma.media.findFirst({
      where: { id, tenantId },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Görsel bulunamadı.' },
      } as ApiResponse);
    }

    // Mağaza ayarlarına kapak resmi olarak kaydet
    const existingSettings = await tenantPrisma.tenantSettings.findFirst({ where: { tenantId } });
    if (existingSettings) {
      await tenantPrisma.tenantSettings.update({
        where: { id: existingSettings.id },
        data: {
          coverImage: media.url,
        } as any,
      });
    }

    return res.json({
      success: true,
      message: 'Kapak resmi güncellendi.',
      data: { coverUrl: media.url },
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Gallery Cover] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'COVER_ERROR', message: 'Kapak resmi değiştirilemedi.' },
    } as ApiResponse);
  }
});

export default router;
