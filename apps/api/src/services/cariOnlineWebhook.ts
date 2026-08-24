import dotenv from 'dotenv';

dotenv.config();

export type RevenueType = 'SUBSCRIPTION_PRO' | 'SUBSCRIPTION_ELITE' | 'TRANSACTION_COMMISSION';

interface TenantWebhookInfo {
  id: string;
  name: string;
  slug: string;
  taxNumber?: string;
}

/**
 * Super Admin Cari Webhook Servisi
 * Platform gelirlerini dış muhasebe sistemi olan Cari Online API'sine senkronize eder.
 */
export async function syncPlatformRevenue(
  type: RevenueType,
  amount: number,
  tenantInfo: TenantWebhookInfo
): Promise<boolean> {
  const webhookUrl = process.env.CARI_ONLINE_WEBHOOK_URL || 'https://api.carionline.com/v1/webhooks/revenue';
  const apiKey = process.env.CARI_ONLINE_API_KEY;

  console.log(`[CariOnlineWebhook] Syncing platform revenue to ERP...`);
  console.log(`- Type: ${type}, Amount: ${amount} TL`);
  console.log(`- Salon: ${tenantInfo.name} (TaxNo: ${tenantInfo.taxNumber || 'Belirtilmemiş'})`);

  const payload = {
    apiKey,
    transactionType: type,
    totalAmount: amount,
    taxNumber: tenantInfo.taxNumber || '1111111111', // Varsayılan veya simüle vergi no
    tenantId: tenantInfo.id,
    tenantName: tenantInfo.name,
    tenantSlug: tenantInfo.slug,
    currency: 'TRY',
    timestamp: new Date().toISOString()
  };

  // API anahtarı yoksa konsola simüle log basıp başarılı say
  if (!apiKey) {
    console.log('[CariOnlineWebhook] [SIMULATOR] Webhook Payload:', JSON.stringify(payload, null, 2));
    return true;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('[CariOnlineWebhook] Revenue sync completed successfully.');
      return true;
    }

    throw new Error(`Cari Online API error. Status: ${response.status}`);
  } catch (error) {
    console.error('[CariOnlineWebhook] Sync failed:', error);
    return false;
  }
}
