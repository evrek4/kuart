// apps/api/src/middlewares/webhookSignature.ts
//
// Webhook Imza Dogrulama Middleware'leri (Asama 3)
// ─────────────────────────────────────────────────
// Iki farkli saglaycı icin imza dogrulama:
//   1. verifyIyzicoWebhook  — Iyzico/PayTR callback imzasi
//   2. verifyMetaWebhook    — WhatsApp Cloud API (Meta) X-Hub-Signature-256
//
// Imza eksik veya hatalioysa: 401 Unauthorized → DB'ye hic yazilmaz.

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ══════════════════════════════════════════════════════════════════
// 1. IYZICO / PAYTR WEBHOOK IMZA DOGRULAMA
// ══════════════════════════════════════════════════════════════════
//
// Iyzico, her callback istegiyle birlikte HTTP header'inda
// x-iyzico-signature gonderir.
//
// Algoritma:
//   HMAC-SHA256(secretKey, rawBody) → hex digest
//
// Referans: https://dev.iyzipay.com/tr/webhook
//
export function verifyIyzicoWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secretKey = process.env.IYZICO_SECRET_KEY || process.env.PAYTR_MERCHANT_KEY || '';

  // Imza header'i yoksa ret
  const signature = (req.headers['x-iyzico-signature'] as string) ||
                    (req.headers['x-paytr-signature'] as string);

  if (!signature) {
    console.warn('[WebhookSig] Iyzico: Imza header eksik — 401');
    res.status(401).json({
      success: false,
      error: {
        code:    'WEBHOOK_SIGNATURE_MISSING',
        message: 'Webhook imzasi eksik. Bu endpoint yalnizca Iyzico/PayTR tarafindan cagrilabilir.',
      },
    });
    return;
  }

  // Raw body'yi dogrulama icin kullan
  // Not: Express JSON parser devredeyse req.body zaten parse edilmis olabilir.
  // Imza dogrulama icin rawBody middleware'i onceden cagrilmis olmali
  // veya JSON.stringify(req.body) kullanilabilir (Iyzico icin yeterli).
  const rawBody =
    (req as any).rawBody ||
    JSON.stringify(req.body);

  if (!secretKey) {
    console.error('[WebhookSig] IYZICO_SECRET_KEY tanimlanmamis — imza dogrulanamaz');
    // Uretim ortaminda her zaman 401 don
    if (process.env.NODE_ENV === 'production') {
      res.status(401).json({
        success: false,
        error: { code: 'WEBHOOK_CONFIG_ERROR', message: 'Webhook yapilandirmasi eksik.' },
      });
      return;
    }
    // Development: gecis izni (sadece test icin)
    next();
    return;
  }

  const expectedSig = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody, 'utf8')
    .digest('base64'); // Iyzico base64 kullanir

  // Timing-safe karsilastirma (timing attack'e karsi)
  const sigBuffer      = Buffer.from(signature,    'base64');
  const expectedBuffer = Buffer.from(expectedSig,  'base64');

  const isValid =
    sigBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!isValid) {
    console.warn('[WebhookSig] Iyzico: Imza gecersiz — 401', {
      received: signature?.substring(0, 20) + '...',
    });
    res.status(401).json({
      success: false,
      error: {
        code:    'WEBHOOK_SIGNATURE_INVALID',
        message: 'Webhook imzasi gecersiz. Istek reddedildi.',
      },
    });
    return;
  }

  console.log('[WebhookSig] Iyzico: Imza gecerli ✓');
  next();
}

// ══════════════════════════════════════════════════════════════════
// 2. META / WHATSAPP CLOUD API WEBHOOK IMZA DOGRULAMA
// ══════════════════════════════════════════════════════════════════
//
// Meta, her POST istegiyle birlikte X-Hub-Signature-256 header'i gonderir.
// Format: "sha256=<hex_digest>"
//
// Algoritma:
//   HMAC-SHA256(appSecret, rawBody) → hex digest
//   Header: "sha256=" + hex
//
// Referans: https://developers.facebook.com/docs/graph-api/webhooks/getting-started
//
export function verifyMetaWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || '';

  const hubSignature = req.headers['x-hub-signature-256'] as string;

  if (!hubSignature) {
    console.warn('[WebhookSig] Meta: X-Hub-Signature-256 eksik — 401');
    res.status(401).json({
      success: false,
      error: {
        code:    'WEBHOOK_SIGNATURE_MISSING',
        message: 'Meta webhook imzasi eksik. Bu endpoint yalnizca Meta/WhatsApp tarafindan cagrilabilir.',
      },
    });
    return;
  }

  if (!appSecret) {
    console.error('[WebhookSig] META_APP_SECRET tanimlanmamis');
    if (process.env.NODE_ENV === 'production') {
      res.status(401).json({
        success: false,
        error: { code: 'WEBHOOK_CONFIG_ERROR', message: 'Webhook yapilandirmasi eksik.' },
      });
      return;
    }
    next();
    return;
  }

  const rawBody =
    (req as any).rawBody ||
    JSON.stringify(req.body);

  // "sha256=<hex>" formatini ayristir
  const [algo, receivedHex] = hubSignature.split('=');
  if (algo !== 'sha256' || !receivedHex) {
    res.status(401).json({
      success: false,
      error: { code: 'WEBHOOK_SIGNATURE_INVALID', message: 'Imza formati gecersiz.' },
    });
    return;
  }

  const expectedHex = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody, 'utf8')
    .digest('hex');

  // Timing-safe hex karsilastirma
  const receivedBuffer = Buffer.from(receivedHex, 'hex');
  const expectedBuffer = Buffer.from(expectedHex, 'hex');

  const isValid =
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

  if (!isValid) {
    console.warn('[WebhookSig] Meta: X-Hub-Signature-256 gecersiz — 401');
    res.status(401).json({
      success: false,
      error: {
        code:    'WEBHOOK_SIGNATURE_INVALID',
        message: 'Meta webhook imzasi gecersiz. Istek reddedildi.',
      },
    });
    return;
  }

  console.log('[WebhookSig] Meta: X-Hub-Signature-256 gecerli ✓');
  next();
}

// ══════════════════════════════════════════════════════════════════
// 3. RAW BODY CAPTURE MIDDLEWARE
// ══════════════════════════════════════════════════════════════════
//
// Imza dogrulama icin ham (parse edilmemis) body gereklidir.
// Bu middleware'i app.ts'de webhook rotalarindan ONCE ekleyin:
//
//   app.use('/api/webhooks', captureRawBody, webhooksRouter);
//   app.use('/api/payments/callback', captureRawBody, paymentsRouter);
//
export function captureRawBody(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => { data += chunk; });
  req.on('end', () => {
    (req as any).rawBody = data;
    // JSON body'yi de parse et (express.json() cagrilmamissa)
    try {
      if (data && !req.body) {
        req.body = JSON.parse(data);
      }
    } catch { /* raw body JSON degilse (form-urlencoded vb.) sorun degil */ }
    next();
  });
}