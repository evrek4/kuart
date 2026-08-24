import { Router, Response } from 'express';
import { getTenantPrisma } from '@kuafor-art/database';
import { ApiResponse } from '@kuafor-art/shared-types';
import { requireTenant, TenantRequest } from '../middlewares/tenant';

const router = Router();

// GET /api/services - Tenant'a ait hizmetleri listele
router.get('/', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const services = await tenantPrisma.service.findMany({
      where: { tenantId }, // IDOR: tenantId zorunlu filtre
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: services,
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Services GET] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICES_FETCH_ERROR', message: 'Hizmet listesi alınamadı.' },
    } as ApiResponse);
  }
});

// POST /api/services - Yeni hizmet ekle
router.post('/', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { name, description, duration, price } = req.body;

    if (!name || !duration) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Hizmet adı ve süresi zorunludur.' },
      } as ApiResponse);
    }

    const newService = await tenantPrisma.service.create({
      data: {
        tenantId,
        name,
        description: description || null,
        duration: Number(duration),
        price: price !== undefined && price !== null && price !== '' ? Number(price) : null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: newService,
      message: 'Hizmet başarıyla eklendi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Services POST] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICES_CREATE_ERROR', message: 'Hizmet oluşturulurken bir hata oluştu.' },
    } as ApiResponse);
  }
});

// PUT /api/services/:id - Hizmet güncelle
router.put('/:id', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { id } = req.params;
    const { name, description, duration, price, isActive } = req.body;

    // IDOR: findFirst + tenantId filtresiyle sahiplik doğrulaması
    const existingService = await tenantPrisma.service.findFirst({
      where: { id, tenantId },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Hizmet bulunamadı.' },
      } as ApiResponse);
    }

    const updatedService = await tenantPrisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(price !== undefined && { price: price !== null && price !== '' ? Number(price) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return res.json({
      success: true,
      data: updatedService,
      message: 'Hizmet güncellendi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Services PUT] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICES_UPDATE_ERROR', message: 'Hizmet güncellenirken hata oluştu.' },
    } as ApiResponse);
  }
});

// DELETE /api/services/:id - Hizmet sil
router.delete('/:id', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { id } = req.params;

    // IDOR: findFirst + tenantId filtresiyle sahiplik doğrulaması
    const existingService = await tenantPrisma.service.findFirst({
      where: { id, tenantId },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Hizmet bulunamadı.' },
      } as ApiResponse);
    }

    await tenantPrisma.service.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Hizmet başarıyla silindi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Services DELETE] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVICES_DELETE_ERROR', message: 'Hizmet silinirken hata oluştu.' },
    } as ApiResponse);
  }
});

export default router;
