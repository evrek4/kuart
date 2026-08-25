import { Router, Response } from 'express';
import multer from 'multer';
import { ApiResponse } from '@kuafor-art/shared-types';
import { requireTenant, TenantRequest } from '../middlewares/tenant';
import { uploadMediaFile } from '../lib/uploadHelper';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir.'));
    }
  },
});

// POST /api/upload - Genel Görsel Yükleme Endpoint'i (Avatar, Logo, Medya)
router.post('/', requireTenant, upload.single('file'), async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant?.id || 'default';
    const folder = (req.body.folder as string) || 'common';
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'Yüklenecek bir dosya seçilmedi.' },
      } as ApiResponse);
    }

    const uploadResult = await uploadMediaFile(file, tenantId, folder);

    return res.status(201).json({
      success: true,
      message: 'Görsel başarıyla yüklendi.',
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        size: uploadResult.size,
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Upload API] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: error.message || 'Dosya yükleme hatası.' },
    } as ApiResponse);
  }
});

export default router;
