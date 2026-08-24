export interface CardDetails {
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  cardHolderName: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Sanal POS Sağlayıcı Arayüzü (Interface)
 * Tüm yerel/uluslararası POS entegrasyonlarının (PayTR, İyzico, Stripe vb.)
 * uymak zorunda olduğu ortak protokol.
 */
export interface IPosProvider {
  /**
   * Kart bilgileri ve tutarla Sanal POS ödeme isteği başlatır.
   */
  initializePayment(amount: number, card: CardDetails, orderId: string): Promise<PaymentResponse>;

  /**
   * Belirtilen işlem ID'sinin güncel ödeme durumunu kontrol eder.
   */
  checkPaymentStatus(transactionId: string): Promise<PaymentResponse>;

  /**
   * Başarılı olmuş bir ödemenin kısmi veya tam iadesini gerçekleştirir.
   */
  refundPayment(transactionId: string): Promise<PaymentResponse>;
}
