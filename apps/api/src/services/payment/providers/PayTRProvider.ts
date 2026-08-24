import { IPosProvider, CardDetails, PaymentResponse } from '../IPosProvider';

/**
 * PayTR POS Sağlayıcı Entegrasyonu
 */
export class PayTRProvider implements IPosProvider {
  private merchantId: string;
  private merchantKey: string;

  constructor(merchantId: string, merchantKey: string) {
    this.merchantId = merchantId;
    this.merchantKey = merchantKey;
  }

  async initializePayment(amount: number, card: CardDetails, orderId: string): Promise<PaymentResponse> {
    console.log(`[PayTRProvider] Initializing payment of ${amount} TL for Order ${orderId}...`);
    console.log(`[PayTRProvider] Using Merchant ID: ${this.merchantId.substring(0, 6)}***`);

    // Basit kredi kartı girdi denetimi
    if (!card.cardNumber || card.cardNumber.replace(/\s+/g, '').length < 16) {
      return {
        success: false,
        error: { code: 'INVALID_CARD', message: 'PayTR: Geçersiz kredi kartı numarası.' }
      };
    }

    // PayTR API istek simülasyonu
    return {
      success: true,
      transactionId: `paytr_tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      status: 'SUCCESS'
    };
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    console.log(`[PayTRProvider] Checking status for transaction ${transactionId}...`);
    return {
      success: true,
      transactionId,
      status: 'SUCCESS'
    };
  }

  async refundPayment(transactionId: string): Promise<PaymentResponse> {
    console.log(`[PayTRProvider] Refunding transaction ${transactionId}...`);
    return {
      success: true,
      transactionId,
      status: 'REFUNDED'
    };
  }
}
