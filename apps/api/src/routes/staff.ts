import { Router, Response } from 'express';
import { prisma, getTenantPrisma } from '@kuafor-art/database';
import { ApiResponse } from '@kuafor-art/shared-types';
import { requireTenant, TenantRequest } from '../middlewares/tenant';

const router = Router();

// GET /api/staff - Tenant'a ait personelleri listele
router.get('/', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const staffList = await tenantPrisma.staff.findMany({
      where: { tenantId }, // IDOR: tenantId zorunlu filtre
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: staffList,
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Staff GET] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'STAFF_FETCH_ERROR', message: 'Personel listesi alınamadı.' },
    } as ApiResponse);
  }
});

// POST /api/staff - Yeni personel ekle
router.post('/', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { name, title, phone, avatar, commissionRate } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Personel adı zorunludur.' },
      } as ApiResponse);
    }

    // ── PLAN KOTASI: Maksimum personel limiti kontrolü ──────────────────────────
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    const maxStaff = (tenant?.plan as any)?.maxStaff ?? null;
    if (maxStaff !== null) {
      const activeStaffCount = await tenantPrisma.staff.count({
        where: { tenantId, isActive: true },
      });
      if (activeStaffCount >= maxStaff) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'STAFF_LIMIT_REACHED',
            message: `Paketinizin izin verdiği maksimum personel sayısına (${maxStaff}) ulaştınız. Daha fazla personel eklemek için paketinizi yükseltin.`,
          },
        } as ApiResponse);
      }
    }
    // ────────────────────────────────────────────────────────────────────────────

    const newStaff = await tenantPrisma.staff.create({
      data: {
        tenantId,
        name,
        title: title || null,
        phone: phone || null,
        avatar: avatar || null,
        commissionRate: commissionRate !== undefined ? Number(commissionRate) : 0,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: newStaff,
      message: 'Personel başarıyla eklendi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Staff POST] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'STAFF_CREATE_ERROR', message: 'Personel oluşturulurken bir hata oluştu.' },
    } as ApiResponse);
  }
});

// PUT /api/staff/:id - Personel güncelle
router.put('/:id', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { id } = req.params;
    const { name, title, phone, avatar, commissionRate, isActive } = req.body;

    // IDOR: findFirst + tenantId filtresiyle sahiplik doğrulaması
    const existingStaff = await tenantPrisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Personel bulunamadı.' },
      } as ApiResponse);
    }

    const updatedStaff = await tenantPrisma.staff.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(commissionRate !== undefined && { commissionRate: Number(commissionRate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return res.json({
      success: true,
      data: updatedStaff,
      message: 'Personel güncellendi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Staff PUT] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'STAFF_UPDATE_ERROR', message: 'Personel güncellenirken hata oluştu.' },
    } as ApiResponse);
  }
});

// DELETE /api/staff/:id - Personel sil
router.delete('/:id', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    const { id } = req.params;

    // IDOR: findFirst + tenantId filtresiyle sahiplik doğrulaması
    const existingStaff = await tenantPrisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Personel bulunamadı.' },
      } as ApiResponse);
    }

    await tenantPrisma.staff.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Personel başarıyla silindi.',
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Staff DELETE] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'STAFF_DELETE_ERROR', message: 'Personel silinirken hata oluştu.' },
    } as ApiResponse);
  }
});

export default router;
