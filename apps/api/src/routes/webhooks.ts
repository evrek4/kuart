import { Router, Request, Response } from 'express';
import { prisma } from '@kuafor-art/database';

const router = Router();

/**
 * @route GET /api/webhooks/test-ping
 * @desc Tünel ve Webhook bağlantısını test eden canlılık kontrolü
 */
router.get('/test-ping', (_req: Request, res: Response) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: '🚀 Kuafor.art Webhook Router Canlı ve Erişilebilir!',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route GET /api/webhooks/whatsapp
 * @desc Meta / WhatsApp Cloud API Webhook Doğrulama (Hub Verification)
 */
router.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'kuafor_art_verify_token';

  if (mode && token === expectedToken) {
    console.log('✅ [WhatsApp Webhook] Verification Successful');
    return res.status(200).send(challenge);
  }

  console.warn('⚠️ [WhatsApp Webhook] Verification Failed. Invalid Token.');
  return res.status(403).json({ success: false, error: 'Verification failed' });
});

/**
 * @route POST /api/webhooks/whatsapp
 * @desc Gelen WhatsApp Webhook Mesajlarını Yakalar ve Loglar
 */
router.post('/whatsapp', async (req: Request, res: Response) => {
  console.log('📲 [WhatsApp Webhook Incoming Payload]:', JSON.stringify(req.body, null, 2));

  try {
    const firstTenant = await prisma.tenant.findFirst();
    if (firstTenant) {
      const recipient = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || req.body?.phone || req.body?.from || 'UNKNOWN_RECIPIENT';
      await prisma.marketingLog.create({
        data: {
          tenantId: firstTenant.id,
          channel: 'WHATSAPP',
          type: 'WEBHOOK_INCOMING',
          recipient,
          status: 'DELIVERED',
        }
      });
      console.log('✅ [MarketingLog] Webhook olayı veritabanına kaydedildi.');
    }
  } catch (err: any) {
    console.warn('⚠️ [MarketingLog Save Error]:', err.message || err);
  }

  res.status(200).json({ success: true, received: true });
});

/**
 * @route GET /api/webhooks/logs
 * @desc Kaydedilen Webhook loglarını sorgular
 */
router.get('/logs', async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.marketingLog.findMany({
      where: { channel: 'WHATSAPP' },
      take: 5
    });
    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/webhooks/payment
 * @desc Gelen Ödeme (PayTR / İyzico) Webhook Bildirimlerini Yakalar
 */
router.post('/payment', async (req: Request, res: Response) => {
  console.log('💳 [Payment Webhook Incoming Payload]:', JSON.stringify(req.body, null, 2));

  res.status(200).send('OK');
});

export default router;
