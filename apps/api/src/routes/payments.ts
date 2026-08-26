import { Router } from 'express';
import { verifyIyzicoWebhook } from '../middlewares/webhookSignature';
import { prisma } from '@kuafor-art/database';

const router = Router();

// =====================================================
// In-Memory Mock Subscription & Payment History Store
// =====================================================
// Gerçek ödeme entegrasyonu (İyzico/Stripe) hazır olana kadar
// bu mock veriler billing sayfasının tam olarak çalışmasını sağlar.

interface MockSubscription {
  tenantId: string;
  planId: string;
  planName: string;
  billingStatus: string;
  nextBillingDate: string | null;
  autoRenewal: boolean;
  cardLastFour: string | null;
}

interface MockPaymentHistoryItem {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED';
  transactionId: string;
  planName: string;
  paidAt: string;
  nextBillingDate: string;
  cardLastFour: string | null;
  appliedCouponCode: string | null;
  originalAmount: number | null;
}

// Global mock stores (bellek içi, sunucu yeniden başlatıldığında sıfırlanır)
const mockSubscriptions: Map<string, MockSubscription> = new Map();
const mockPaymentHistory: MockPaymentHistoryItem[] = [];

// Test için varsayılan abonelik seed'i
function getOrCreateMockSubscription(tenantId: string): MockSubscription {
  if (!mockSubscriptions.has(tenantId)) {
    mockSubscriptions.set(tenantId, {
      tenantId,
      planId: 'free-plan',
      planName: 'FREE',
      billingStatus: 'ACTIVE',
      nextBillingDate: null,
      autoRenewal: false,
      cardLastFour: null,
    });
  }
  return mockSubscriptions.get(tenantId)!;
}

// Tenant ID'yi request'ten al (JWT veya header üzerinden)
function getTenantId(req: any): string {
  // requireAuth middleware varsa req.user üzerinden alınır
  // Yoksa fallback: 'mock-tenant-id'
  return req.user?.tenantId || req.tenant?.id || 'mock-tenant-id';
}

// =====================================================
// GET /api/payments/subscription
// Mevcut abonelik bilgisini döndür
// =====================================================
router.get('/subscription', async (req: any, res: any) => {
  try {
    const tenantId = getTenantId(req);

    // Prisma'dan gerçek tenant ve plan bilgisini al
    let planName = 'FREE';
    let planId = '';
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true }
      });
      if (tenant?.plan) {
        planName = (tenant.plan as any).name || 'FREE';
        planId = tenant.planId || '';
      }
    } catch {
      // Prisma ulaşılamazsa mock verilere devam et
    }

    const sub = getOrCreateMockSubscription(tenantId);
    sub.planName = planName;
    if (planId) sub.planId = planId;

    return res.json({
      success: true,
      data: {
        planName: sub.planName,
        planId: sub.planId,
        billingStatus: sub.billingStatus,
        nextBillingDate: sub.nextBillingDate,
        autoRenewal: sub.autoRenewal,
        cardLastFour: sub.cardLastFour,
      }
    });
  } catch (error: any) {
    console.error('[Payments/Subscription] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Abonelik bilgisi alınamadı.' }
    });
  }
});

// =====================================================
// GET /api/payments/plans
// Mevcut aktif abonelik planlarını listele
// =====================================================
router.get('/plans', async (req: any, res: any) => {
  try {
    // Önce Prisma'dan gerçek planları almayı dene
    let plans: any[] = [];
    try {
      plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
      });
    } catch {
      // Prisma ulaşılamazsa fallback mock planlar
    }

    if (!plans || plans.length === 0) {
      // Fallback: hardcoded mock planlar
      plans = [
        {
          id: 'plan-free',
          name: 'FREE',
          price: 0,
          storageLimitMB: 500,
          features: JSON.stringify(['basic_booking', '1_staff']),
          isFree: true,
          isActive: true,
          allowPortalThemes: false,
        },
        {
          id: 'plan-pro',
          name: 'PRO',
          price: 299,
          storageLimitMB: 5120,
          features: JSON.stringify(['basic_booking', 'unlimited_staff', 'payment_gateway']),
          isFree: false,
          isActive: true,
          allowPortalThemes: false,
        },
        {
          id: 'plan-elite',
          name: 'ELITE',
          price: 599,
          storageLimitMB: 20480,
          features: JSON.stringify(['basic_booking', 'unlimited_staff', 'payment_gateway', 'custom_domain']),
          isFree: false,
          isActive: true,
          allowPortalThemes: true,
        },
      ];
    }

    return res.json({ success: true, data: plans });
  } catch (error: any) {
    console.error('[Payments/Plans] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Paket listesi alınamadı.' }
    });
  }
});

// =====================================================
// GET /api/payments/history
// Fatura ve ödeme geçmişini listele
// =====================================================
router.get('/history', async (req: any, res: any) => {
  try {
    const tenantId = getTenantId(req);
    const tenantHistory = mockPaymentHistory.filter(h => h.tenantId === tenantId);

    return res.json({ success: true, data: tenantHistory });
  } catch (error: any) {
    console.error('[Payments/History] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Fatura geçmişi alınamadı.' }
    });
  }
});

// =====================================================
// GET /api/payments/history/:id/pdf
// Belirli bir ödeme makbuzu için PDF linki (mock)
// =====================================================
router.get('/history/:id/pdf', (req: any, res: any) => {
  const { id } = req.params;
  const item = mockPaymentHistory.find(h => h.id === id);
  if (!item) {
    return res.status(404).json({
      success: false,
      error: { message: 'Fatura bulunamadı.' }
    });
  }
  // Gerçek uygulamada PDF oluşturulur ve stream edilir
  // Şimdilik JSON makbuz döndürüyoruz
  res.setHeader('Content-Type', 'application/json');
  return res.json({
    success: true,
    message: 'PDF oluşturma özelliği yakında aktif olacak.',
    data: item
  });
});

// =====================================================
// POST /api/payments/checkout
// Ödeme oturumu başlat — mock 3D Secure simülatörü
// =====================================================
router.post('/checkout', async (req: any, res: any) => {
  try {
    const { planId, couponCode } = req.body;
    const tenantId = getTenantId(req);

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: { message: 'planId zorunludur.' }
      });
    }

    // Plan bilgisini bul
    let planName = 'PLAN';
    let planPrice = 0;
    let originalPrice: number | null = null;
    let discountAmount = 0;

    try {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (plan) {
        planName = (plan as any).name;
        planPrice = (plan as any).price;
      }
    } catch {
      // Fallback mock plan fiyatları
      const mockPrices: Record<string, { name: string; price: number }> = {
        'plan-free': { name: 'FREE', price: 0 },
        'plan-pro': { name: 'PRO', price: 299 },
        'plan-elite': { name: 'ELITE', price: 599 },
      };
      if (mockPrices[planId]) {
        planName = mockPrices[planId].name;
        planPrice = mockPrices[planId].price;
      }
    }

    // Kupon indirimi uygula
    if (couponCode) {
      const couponMap: Record<string, { type: 'PERCENTAGE' | 'FIXED'; amount: number }> = {
        'LANSMAN50': { type: 'PERCENTAGE', amount: 50 },
        'LOKAL100': { type: 'FIXED', amount: 100 },
      };
      const coupon = couponMap[couponCode.toUpperCase()];
      if (coupon) {
        originalPrice = planPrice;
        if (coupon.type === 'PERCENTAGE') {
          discountAmount = (planPrice * coupon.amount) / 100;
        } else {
          discountAmount = coupon.amount;
        }
        planPrice = Math.max(0, planPrice - discountAmount);
      }
    }

    // Ücretsiz plan ise direkt geçiş yap (ödeme gerekmez)
    if (planPrice === 0) {
      // Aboneliği güncelle
      const sub = getOrCreateMockSubscription(tenantId);
      sub.planId = planId;
      sub.planName = planName;
      sub.billingStatus = 'ACTIVE';
      sub.nextBillingDate = null;
      sub.autoRenewal = false;

      // Tenant planını Prisma'da güncellemeyi dene
      try {
        const plan = await prisma.subscriptionPlan.findFirst({ where: { isFree: true } });
        if (plan) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: { planId: plan.id }
          });
        }
      } catch { /* ignore */ }

      return res.json({
        success: true,
        data: {
          paymentPageUrl: `/dashboard/billing?payment=success`,
          isFree: true
        }
      });
    }

    // Mock 3D Secure Ödeme Sayfası URL'si
    // Gerçek uygulamada İyzico/Stripe checkout URL'si döner
    const sessionId = `mock-session-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    // Mock ödeme sayfası: Next.js içinde statik bir sayfa kullanıyoruz
    const paymentPageUrl = `/payment-simulator?sessionId=${sessionId}&planId=${planId}&planName=${encodeURIComponent(planName)}&amount=${planPrice}&tenantId=${tenantId}&couponCode=${couponCode || ''}&originalAmount=${originalPrice || planPrice}`;

    return res.json({
      success: true,
      data: {
        sessionId,
        paymentPageUrl,
        planName,
        amount: planPrice,
        originalAmount: originalPrice,
        currency: 'TRY',
      }
    });
  } catch (error: any) {
    console.error('[Payments/Checkout] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ödeme oturumu başlatılırken hata oluştu.' }
    });
  }
});

// =====================================================
// POST /api/payments/confirm (Mock 3D Secure callback)
// Ödeme simülatöründen gelen onay webhook'u
// =====================================================
router.post('/confirm', async (req: any, res: any) => {
  try {
    const { sessionId, tenantId, planId, planName, amount, originalAmount, couponCode, cardLastFour } = req.body;

    if (!tenantId || !planId) {
      return res.status(400).json({
        success: false,
        error: { message: 'tenantId ve planId zorunludur.' }
      });
    }

    // Aboneliği güncelle
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const sub = getOrCreateMockSubscription(tenantId);
    sub.planId = planId;
    sub.planName = planName || 'PRO';
    sub.billingStatus = 'ACTIVE';
    sub.nextBillingDate = nextBillingDate.toISOString();
    sub.autoRenewal = true;
    sub.cardLastFour = cardLastFour || '4242';

    // Fatura geçmişine ekle
    const historyItem: MockPaymentHistoryItem = {
      id: `pay-${Date.now()}`,
      tenantId,
      amount: Number(amount) || 0,
      currency: 'TRY',
      status: 'SUCCESS',
      transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
      planName: planName || 'PRO',
      paidAt: new Date().toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
      cardLastFour: cardLastFour || '4242',
      appliedCouponCode: couponCode || null,
      originalAmount: originalAmount ? Number(originalAmount) : null,
    };
    mockPaymentHistory.push(historyItem);

    // Prisma'da tenant planını güncellemeyi dene
    try {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (plan) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            planId,
            mediaCapacity: (plan as any).storageLimitMB * 1024 * 1024
          }
        });
      }
    } catch { /* ignore if Prisma fails */ }

    return res.json({
      success: true,
      message: 'Ödeme onaylandı.',
      data: historyItem
    });
  } catch (error: any) {
    console.error('[Payments/Confirm] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Ödeme onaylanırken hata oluştu.' }
    });
  }
});


// =====================================================
// POST /api/payments/callback
// Iyzico / PayTR Gercek Odeme Donus Webhook'u (Callback)
//
// GUVENLIK: verifyIyzicoWebhook middleware'i x-iyzico-signature
// basligi olmadan bu handler CALISMAZ.
// Imza eksik veya hataliiysa 401 Unauthorized doner ve
// DB'ye HICBIR kayit yazilmaz.
// =====================================================
router.post('/callback', verifyIyzicoWebhook, async (req: any, res: any) => {
  try {
    const {
      status,
      paymentId,
      conversationId,
      paidPrice,
      basketId,
    } = req.body;

    console.log('[Payments/Callback] Iyzico callback alindi:', {
      status,
      paymentId,
      conversationId,
      paidPrice,
      basketId,
    });

    if (status !== 'success') {
      console.warn('[Payments/Callback] Odeme basarisiz:', status);
      return res.status(200).json({
        success: false,
        message: 'Odeme basarisiz veya iptal edildi.',
        data: { status }
      });
    }

    // Basarili odeme: Aboneligi guncelle
    // Gercek entegrasyonda conversationId uzerinden tenant'i bul
    // ve planId'yi guncelle
    console.log('[Payments/Callback] Odeme onaylandi. paymentId:', paymentId);

    return res.status(200).json({
      success: true,
      message: 'Odeme basariyla islendi.',
      data: { paymentId, status: 'processed' }
    });
  } catch (error: any) {
    console.error('[Payments/Callback] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Callback isleme hatasi.' }
    });
  }
});
export default router;
