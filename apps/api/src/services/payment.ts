import { CardDetails } from './payment/IPosProvider';
import { PosFactory } from './payment/posFactory';

export { CardDetails };

/**
 * @deprecated Yeni çoklu POS (Factory Pattern) mimarisine geçiş için geriye dönük uyumluluk köprüsü.
 * İşlemleri otomatik olarak PosFactory.getProvider(tenantId) üzerinden yönlendirir.
 */
export async function processPayment(
  amount: number,
  cardDetails: CardDetails,
  tenantId: string
) {
  try {
    const { provider } = await PosFactory.getProvider(tenantId);
    const legacyOrderId = 'legacy_ord_' + Math.random().toString(36).substring(7);
    const response = await provider.initializePayment(amount, cardDetails, legacyOrderId);

    if (response.success) {
      return {
        success: true,
        transactionId: response.transactionId
      };
    } else {
      return {
        success: false,
        error: 'Payment failed'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: { code: 'PAYMENT_ROUTING_ERROR', message: error.message }
    };
  }
}
