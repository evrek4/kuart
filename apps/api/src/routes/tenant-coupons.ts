import { Router, Response } from 'express';
import { getTenantPrisma } from '@kuafor-art/database';
import { requireTenant, TenantRequest } from '../middlewares/tenant';
import { requireAuth, requireTenantAdmin, AuthRequest } from '../middlewares/auth';
import { ApiResponse } from '@kuafor-art/shared-types';

const router = Router();

// =====================================================
// 1. GET /api/tenant-coupons
// Salon içi tüm kuponları getir (Admin)
// =====================================================
router.get('/', requireTenant, requireAuth, requireTenantAdmin, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const coupons = await tenantPrisma.tenantCoupon.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: coupons } as ApiResponse);
  } catch (error: any) {
    console.error('[TenantCoupons/Get] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Kuponlar alınamadı.' }
    } as ApiResponse);
  }
});

// =====================================================
// 2. POST /api/tenant-coupons
// Yeni salon kuponu oluştur (Admin)
// =====================================================
router.post('/', requireTenant, requireAuth, requireTenantAdmin, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const { code, discountType, discountAmount, maxUses, expiresAt } = req.body;
    
    if (!code || !discountType || discountAmount === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Kupon kodu, indirim türü ve tutarı zorunludur.' }
      } as ApiResponse);
    }

    const tenantPrisma = getTenantPrisma(tenantId);
    const normalizedCode = code.trim().toUpperCase();
    
    // Aynı kodla kayıtlı kupon var mı kontrol et
    const existing = await tenantPrisma.tenantCoupon.findUnique({
      where: { tenantId_code: { tenantId, code: normalizedCode } }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_CODE', message: 'Bu kupon kodu zaten kullanımda.' }
      } as ApiResponse);
    }

    const newCoupon = await tenantPrisma.tenantCoupon.create({
      data: {
        tenantId,
        code: normalizedCode,
        discountType: discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
        discountAmount: Number(discountAmount),
        maxUses: maxUses !== undefined && maxUses !== null && maxUses !== '' ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      }
    });

    return res.status(201).json({
      success: true,
      data: newCoupon,
      message: 'Kupon başarıyla oluşturuldu.'
    } as ApiResponse);
  } catch (error: any) {
    console.error('[TenantCoupons/Post] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Kupon oluşturulamadı.' }
    } as ApiResponse);
  }
});

// =====================================================
// 3. POST /api/tenant-coupons/validate
// Vitrin randevu adımı için kupon doğrulama (Public - tenant aware)
// =====================================================
router.post('/validate', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const { code, totalAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Kupon kodu girilmelidir.' }
      } as ApiResponse);
    }

    const normalizedCode = code.trim().toUpperCase();
    const tenantPrisma = getTenantPrisma(tenantId);

    const coupon = await tenantPrisma.tenantCoupon.findFirst({
      where: {
        tenantId,
        code: normalizedCode,
        isActive: true
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: { code: 'COUPON_NOT_FOUND', message: 'Geçersiz veya süresi dolmuş kupon kodu.' }
      } as ApiResponse);
    }

    // 1. Son kullanma tarihi kontrolü
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'COUPON_EXPIRED', message: 'Bu kuponun geçerlilik süresi dolmuştur.' }
      } as ApiResponse);
    }

    // 2. Maksimum kullanım limiti kontrolü
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        error: { code: 'COUPON_LIMIT_REACHED', message: 'Bu kuponun kullanım kotası dolmuştur.' }
      } as ApiResponse);
    }

    const currentTotal = totalAmount !== undefined ? Number(totalAmount) : 0;
    let discount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (currentTotal * coupon.discountAmount) / 100;
    } else {
      discount = coupon.discountAmount;
    }

    const finalAmount = Math.max(0, currentTotal - discount);

    return res.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        calculatedDiscount: Math.round(discount * 100) / 100,
        originalTotal: currentTotal,
        discountedTotal: Math.round(finalAmount * 100) / 100
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('[TenantCoupons/Validate] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Kupon doğrulanırken hata oluştu.' }
    } as ApiResponse);
  }
});

// =====================================================
// 4. PUT /api/tenant-coupons/:id
// Salon kuponu güncelle / durum değiştir (Admin)
// =====================================================
router.put('/:id', requireTenant, requireAuth, requireTenantAdmin, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const { id } = req.params;
    const { isActive, discountAmount, maxUses, expiresAt } = req.body;

    const tenantPrisma = getTenantPrisma(tenantId);

    const existing = await tenantPrisma.tenantCoupon.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kupon bulunamadı.' }
      } as ApiResponse);
    }
    
    const updatedCoupon = await tenantPrisma.tenantCoupon.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        discountAmount: discountAmount !== undefined ? Number(discountAmount) : existing.discountAmount,
        maxUses: maxUses !== undefined ? (maxUses ? Number(maxUses) : null) : existing.maxUses,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existing.expiresAt,
      }
    });

    return res.json({
      success: true,
      data: updatedCoupon,
      message: 'Kupon güncellendi.'
    } as ApiResponse);
  } catch (error: any) {
    console.error('[TenantCoupons/Put] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Kupon güncellenemedi.' }
    } as ApiResponse);
  }
});

// =====================================================
// 5. DELETE /api/tenant-coupons/:id
// Salon kuponu sil (Admin)
// =====================================================
router.delete('/:id', requireTenant, requireAuth, requireTenantAdmin, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const { id } = req.params;

    const tenantPrisma = getTenantPrisma(tenantId);

    const existing = await tenantPrisma.tenantCoupon.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kupon bulunamadı.' }
      } as ApiResponse);
    }
    
    await tenantPrisma.tenantCoupon.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Kupon başarıyla silindi.'
    } as ApiResponse);
  } catch (error: any) {
    console.error('[TenantCoupons/Delete] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Kupon silinemedi.' }
    } as ApiResponse);
  }
});

export default router;
