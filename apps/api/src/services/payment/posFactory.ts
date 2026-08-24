import { CardDetails } from './IPosProvider';

export class PosFactory {
  static async getProvider(_tenantId?: string) {
    const provider = {
      initializePayment: async (_amount: number, _cardDetails: CardDetails, _orderId: string) => ({
        success: true,
        transactionId: `mock-tx-${Date.now()}`
      })
    };
    return { provider };
  }
}
