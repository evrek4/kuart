import { prisma } from '@kuafor-art/database';

export interface CheckoutFormParams {
  tenantId: string;
  planId: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  callbackUrl?: string;
  couponCode?: string;
}

export interface CheckoutFormResponse {
  success: boolean;
  token: string;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  error?: { code: string; message: string };
}

export interface CallbackVerificationResult {
  success: boolean;
  tenantId: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  cardUserKey: string;
  cardToken: string;
  cardLastFour: string;
  appliedCouponCode?: string | null;
  originalAmount?: number | null;
  error?: { code: string; message: string };
}

// In-memory token store for 3D Secure initialization tracking in simulation / native handling
const checkoutTokenStore = new Map<string, {
  tenantId: string;
  planId: string;
  planName: string;
  amount: number;
  appliedCouponCode?: string | null;
  originalAmount?: number | null;
  createdAt: number;
}>();

export class PosService {
  /**
   * 3D Secure Ödeme Formu Başlatma (iyzipay.checkoutFormInitialize)
   * Müşterinin saklı kart izni (registerCard: 1) ile ödeme oturumu açar.
   */
  static async initializeCheckoutForm(params: CheckoutFormParams): Promise<CheckoutFormResponse> {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: params.planId }
      });

      if (!plan) {
        return {
          success: false,
          token: '',
          error: { code: 'PLAN_NOT_FOUND', message: 'Seçilen abonelik paketi bulunamadı.' }
        };
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: params.tenantId }
      });

      if (!tenant) {
        return {
          success: false,
          token: '',
          error: { code: 'TENANT_NOT_FOUND', message: 'Salon kaydı bulunamadı.' }
        };
      }

      let finalAmount = plan.price;
      let appliedCouponCode: string | null = null;
      let originalAmount: number | null = null;

      if (params.couponCode && params.couponCode.trim()) {
        const coupon = await prisma.coupon.findFirst({
          where: { code: params.couponCode.trim().toUpperCase(), isActive: true }
        });

        if (coupon) {
          const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();
          const notLimitReached = coupon.maxUses === null || coupon.usedCount < coupon.maxUses;

          if (notExpired && notLimitReached) {
            appliedCouponCode = coupon.code;
            originalAmount = plan.price;

            let discountAmount = 0;
            if (coupon.discountType === 'PERCENTAGE') {
              discountAmount = plan.price * (coupon.discountAmount / 100);
            } else if (coupon.discountType === 'FIXED') {
              discountAmount = coupon.discountAmount;
            }
            if (discountAmount > plan.price) {
              discountAmount = plan.price;
            }
            finalAmount = plan.price - discountAmount;
          }
        }
      }

      const token = `iyzi_token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      
      // Token ve sepet detaylarını geçici hafızada / DB'de tutuyoruz
      checkoutTokenStore.set(token, {
        tenantId: tenant.id,
        planId: plan.id,
        planName: plan.name,
        amount: finalAmount,
        appliedCouponCode,
        originalAmount,
        createdAt: Date.now()
      });

      const callbackUrl = params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/callback`;

      // Simüle edilen İyzico Form HTML içeriği (Prod'da gercekte İyzico Checkout script veya URL döner)
      const checkoutFormContent = `
        <div id="iyzipay-checkout-form" class="responsive">
          <iframe src="${callbackUrl}?token=${token}&simulate=1" width="100%" height="600px" frameborder="0"></iframe>
        </div>
      `;

      return {
        success: true,
        token,
        checkoutFormContent,
        paymentPageUrl: `${callbackUrl}?token=${token}&simulate=1`
      };
    } catch (error: any) {
      console.error('[PosService] Checkout initialization failed:', error);
      return {
        success: false,
        token: '',
        error: { code: 'CHECKOUT_INIT_ERROR', message: error.message || 'Ödeme formu başlatılamadı.' }
      };
    }
  }

  /**
   * 3D Secure Callback / Webhook Doğrulama
   * İyzico'dan dönen token ile ödeme durumunu sorgular ve kartu saklama bilgilerini üretir.
   */
  static async verifyCallback(token: string, simulatedStatus: string = 'SUCCESS'): Promise<CallbackVerificationResult> {
    try {
      const stored = checkoutTokenStore.get(token);

      if (!stored) {
        // Eğer token hafızada yoksa (örn: restart olmuşsa), token string'inden ya da varsayılan değerlerden üret
        console.warn(`[PosService] Token ${token} memory'de bulunamadı, fallback doğrulama yapılıyor.`);
      }

      const tenantId = stored?.tenantId || '';
      const planId = stored?.planId || '';
      const planName = stored?.planName || 'PRO Plan';
      const amount = stored?.amount || 299.0;

      if (simulatedStatus === 'FAILURE' || simulatedStatus === 'FAILED') {
        return {
          success: false,
          tenantId,
          planId,
          planName,
          amount,
          currency: 'TRY',
          transactionId: `tx_failed_${Date.now()}`,
          cardUserKey: '',
          cardToken: '',
          cardLastFour: '',
          error: { code: 'PAYMENT_FAILED', message: '3D Secure ödeme işlemi başarısız oldu.' }
        };
      }

      // İyzico'dan dönen saklı kart bilgileri (cardUserKey, cardToken)
      const cardUserKey = `cuk_${Math.random().toString(36).substring(2, 12)}`;
      const cardToken = `ctk_${Math.random().toString(36).substring(2, 12)}`;
      const cardLastFour = `${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionId = `iyzi_tx_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

      const appliedCouponCode = stored?.appliedCouponCode || null;
      const originalAmount = stored?.originalAmount || null;

      // Temizlik
      if (token) checkoutTokenStore.delete(token);
 
      return {
        success: true,
        tenantId,
        planId,
        planName,
        amount,
        currency: 'TRY',
        transactionId,
        cardUserKey,
        cardToken,
        cardLastFour,
        appliedCouponCode,
        originalAmount
      };
    } catch (error: any) {
      console.error('[PosService] Callback verification failed:', error);
      return {
        success: false,
        tenantId: '',
        planId: '',
        planName: '',
        amount: 0,
        currency: 'TRY',
        transactionId: '',
        cardUserKey: '',
        cardToken: '',
        cardLastFour: '',
        error: { code: 'VERIFICATION_ERROR', message: error.message || 'Ödeme doğrulama hatası.' }
      };
    }
  }

  /**
   * Otomatik Tekrarlayan Tahsilat (Recurring Payment - Non-3D)
   * iyzico kart depolama altyapısı (iyzipay.payment.create) üzerinden çekim simülasyonu yapar.
   */
  static async processRecurringPayment(
    tenantId: string,
    amount: number,
    planName: string
  ): Promise<{ status: 'SUCCESS' | 'FAILURE'; errorMessage?: string; paymentId?: string }> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        return {
          status: 'FAILURE',
          errorMessage: 'Salon kaydı bulunamadı.'
        };
      }

      if (!tenant.cardToken || !tenant.cardUserKey) {
        return {
          status: 'FAILURE',
          errorMessage: 'Saklı kart tokenı bulunamadı. Otomatik ödeme başlatılamaz.'
        };
      }

      // İyzico API çağrısını simüle ediyoruz (iyzipay.payment.create)
      // cardUserKey: tenant.cardUserKey
      // cardToken: tenant.cardToken
      const paymentId = `iyzi_rec_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

      // Kart token'ı 'fail' içeriyorsa veya simüle edilen bir başarısızlık senaryosu için:
      if (tenant.cardToken.includes('fail') || amount > 5000) {
        return {
          status: 'FAILURE',
          errorMessage: 'Kart bakiyesi yetersiz veya banka tarafından reddedildi.'
        };
      }

      return {
        status: 'SUCCESS',
        paymentId
      };
    } catch (error: any) {
      console.error('[PosService] processRecurringPayment error:', error);
      return {
        status: 'FAILURE',
        errorMessage: error.message || 'Tekrarlayan ödeme tahsil edilemedi.'
      };
    }
  }
}
