import { IPosProvider, CardDetails, PaymentResponse } from '../IPosProvider';

/**
 * İyzico POS Sağlayıcı Entegrasyonu
 */
export class IyzicoProvider implements IPosProvider {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async initializePayment(amount: number, card: CardDetails, orderId: string): Promise<PaymentResponse> {
    console.log(`[IyzicoProvider] Initializing payment of ${amount} TL for Order ${orderId}...`);
    console.log(`[IyzicoProvider] Using API Key: ${this.apiKey.substring(0, 6)}***`);
    
    // Basit kredi kartı girdi denetimi
    if (!card.cardNumber || card.cardNumber.replace(/\s+/g, '').length < 16) {
      return {
        success: false,
        error: { code: 'INVALID_CARD', message: 'İyzico: Geçersiz kredi kartı numarası.' }
      };
    }

    // İyzico API istek simülasyonu
    return {
      success: true,
      transactionId: `iyzi_tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      status: 'SUCCESS'
    };
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    console.log(`[IyzicoProvider] Checking status for transaction ${transactionId}...`);
    return {
      success: true,
      transactionId,
      status: 'SUCCESS'
    };
  }

  async refundPayment(transactionId: string): Promise<PaymentResponse> {
    console.log(`[IyzicoProvider] Refunding transaction ${transactionId}...`);
    return {
      success: true,
      transactionId,
      status: 'REFUNDED'
    };
  }
}
