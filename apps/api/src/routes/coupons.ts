import { Router } from 'express';
const router = Router();

// In-Memory Coupons Database
let coupons = [
  {
    id: 'coupon-1',
    code: 'LANSMAN50',
    discountType: 'PERCENTAGE',
    discountAmount: 50,
    maxUses: 100,
    usedCount: 12,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'coupon-2',
    code: 'LOKAL100',
    discountType: 'FIXED',
    discountAmount: 100,
    maxUses: null,
    usedCount: 5,
    expiresAt: null,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Get all coupons
router.get('/admin', (req, res) => {
  res.json({ success: true, data: coupons });
});

// Create new coupon
router.post('/admin', (req, res) => {
  const { code, discountType, discountAmount, maxUses, expiresAt } = req.body;
  const newCoupon = {
    id: `coupon-${Math.random().toString(36).substr(2, 9)}`,
    code: code.trim().toUpperCase(),
    discountType,
    discountAmount: Number(discountAmount),
    maxUses: maxUses !== undefined && maxUses !== null ? Number(maxUses) : null,
    usedCount: 0,
    expiresAt: expiresAt || null,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  coupons.push(newCoupon);
  res.json({ success: true, data: newCoupon });
});

// Update coupon
router.put('/admin/:id', (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const index = coupons.findIndex(c => c.id === id);
  if (index !== -1) {
    coupons[index] = {
      ...coupons[index],
      isActive: isActive !== undefined ? isActive : coupons[index].isActive
    };
    res.json({ success: true, data: coupons[index] });
  } else {
    res.status(404).json({ success: false, error: { message: 'Coupon not found' } });
  }
});

// =====================================================
// POST /validate — Kupon Doğrulama (Billing sayfasından çağrılır)
// Body: { code: string, planId: string }
// =====================================================
router.post('/validate', async (req: any, res: any) => {
  const { code, planId } = req.body;

  if (!code || !planId) {
    return res.status(400).json({
      success: false,
      error: { message: 'Kupon kodu ve plan ID zorunludur.' }
    });
  }

  const normalizedCode = code.trim().toUpperCase();
  const coupon = coupons.find(c => c.code === normalizedCode && c.isActive);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      error: { message: 'Geçersiz veya süresi dolmuş kupon kodu.' }
    });
  }

  // Kullanım limiti kontrolü
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({
      success: false,
      error: { message: 'Bu kuponun kullanım limiti dolmuştur.' }
    });
  }

  // Son kullanma tarihi kontrolü
  if (coupon.expiresAt) {
    const expiry = new Date(coupon.expiresAt);
    if (expiry < new Date()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Bu kuponun geçerlilik süresi dolmuştur.' }
      });
    }
  }

  // Plan fiyatını bul (Prisma veya fallback mock)
  let planPrice = 299; // varsayılan PRO fiyatı
  try {
    const { prisma } = await import('@kuafor-art/database');
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (plan) {
      planPrice = (plan as any).price;
    }
  } catch {
    // Prisma ulaşılamazsa mock fiyatlar
    const mockPrices: Record<string, number> = {
      'plan-free': 0, 'plan-pro': 299, 'plan-elite': 599
    };
    if (mockPrices[planId] !== undefined) {
      planPrice = mockPrices[planId];
    }
  }

  // İndirim hesapla
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (planPrice * coupon.discountAmount) / 100;
  } else {
    discountAmount = coupon.discountAmount;
  }

  const discountedPrice = Math.max(0, planPrice - discountAmount);

  return res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount,
      originalPrice: planPrice,
      discountedPrice,
    }
  });
});

// Delete coupon
router.delete('/admin/:id', (req, res) => {
  const { id } = req.params;
  const index = coupons.findIndex(c => c.id === id);
  if (index !== -1) {
    coupons.splice(index, 1);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } else {
    res.status(404).json({ success: false, error: { message: 'Coupon not found' } });
  }
});

export default router;
