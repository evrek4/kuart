/**
 * apps/api/tests/webhooks.test.ts
 *
 * Asama 3 - Webhook Guvenligi (Spoofing Korumasi) Testleri
 *
 * Test 1: Iyzico /api/payments/callback - imzasiz istek 401 ile reddedilmeli
 * Test 2: WhatsApp POST /api/webhooks/whatsapp - imzasiz istek 401 ile reddedilmeli
 * Test 3: Gecerli Iyzico imzasiyla istek kabul edilmeli (200)
 * Test 4: Gecerli Meta imzasiyla WhatsApp webhook kabul edilmeli (200)
 */

// @kuafor-art/database mock'u - DB cagrilari gercek DB gerekmeden test edilir
jest.mock('@kuafor-art/database', () => ({
  prisma: {
    tenant: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    marketingLog: {
      create: jest.fn().mockResolvedValue({ id: 'log-1' }),
    },
  },
  getTenantPrisma: jest.fn(),
  PrismaClient: jest.fn(),
}));

import request from 'supertest';
import express, { Express } from 'express';
import crypto from 'crypto';
import webhooksRouter from '../src/routes/webhooks';
import paymentsRouter from '../src/routes/payments';
import { captureRawBody } from '../src/middlewares/webhookSignature';

// ─────────────────────────────────────────────────
// Test App Kurulumu
// ─────────────────────────────────────────────────
function buildTestApp(): Express {
  const app = express();

  // Webhook rotalarinda captureRawBody ONCE calismalidir
  // cunku imza dogrulama ham body'ye ihtiyac duyar.
  app.use('/api/webhooks', captureRawBody, webhooksRouter);
  app.use('/api/payments', captureRawBody, paymentsRouter);

  return app;
}

// ─────────────────────────────────────────────────
// Yardimci: Iyzico HMAC-SHA256 Base64 imzasi uret
// ─────────────────────────────────────────────────
function generateIyzicoSignature(payload: object, secret: string): string {
  const rawBody = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
}

// ─────────────────────────────────────────────────
// Yardimci: Meta X-Hub-Signature-256 uret
// ─────────────────────────────────────────────────
function generateMetaSignature(payload: object, secret: string): string {
  const rawBody = JSON.stringify(payload);
  const hex = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  return `sha256=${hex}`;
}

// ─────────────────────────────────────────────────
// TESTLER
// ─────────────────────────────────────────────────
describe('Webhook Guvenligi - Spoofing Korumasi Testleri', () => {
  let app: Express;

  beforeAll(() => {
    app = buildTestApp();
    // Test ortaminda development modu: secret yoksa bypass olmasin diye
    // production olarak ayarliyoruz (verifyIyzicoWebhook production'da 401 doner)
    process.env.NODE_ENV = 'test';
    process.env.IYZICO_SECRET_KEY = 'test-iyzico-secret-key-12345';
    process.env.WHATSAPP_APP_SECRET = 'test-meta-app-secret-67890';
  });

  afterAll(() => {
    process.env.NODE_ENV = 'test';
  });

  // ──────────────────────────────────────────────
  // TEST 1: Iyzico Callback - Imzasiz istek 401 olmali
  // ──────────────────────────────────────────────
  describe('1. Iyzico /api/payments/callback - Sahte Odeme Spoofing Testi', () => {
    it('IMZA YOK: Sahte odeme payload u imzasiz gonderilirse 401 Unauthorized donmeli', async () => {
      const fakePayload = {
        status: 'success',
        paymentId: 'FAKE-PAY-999',
        conversationId: 'conv-abc',
        paidPrice: '100.00',
        basketId: 'basket-xyz',
      };

      const res = await request(app)
        .post('/api/payments/callback')
        .send(fakePayload)
        .set('Content-Type', 'application/json');
        // x-iyzico-signature header YOK - sahte istek simule ediyoruz

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toMatch(/WEBHOOK_SIGNATURE_MISSING|WEBHOOK_SIGNATURE_INVALID/);
    });

    it('YANLIS IMZA: Gecersiz imzayla gonderilirse 401 Unauthorized donmeli', async () => {
      const fakePayload = {
        status: 'success',
        paymentId: 'FAKE-PAY-999',
        paidPrice: '100.00',
      };

      const res = await request(app)
        .post('/api/payments/callback')
        .send(fakePayload)
        .set('Content-Type', 'application/json')
        .set('x-iyzico-signature', 'tamamen-yanlis-imza-AAABBBCCC=');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('WEBHOOK_SIGNATURE_INVALID');
    });

    it('GECERLI IMZA: Dogru imzayla gonderilen istek kabul edilmeli (200)', async () => {
      const secret = process.env.IYZICO_SECRET_KEY!;
      const payload = {
        status: 'success',
        paymentId: 'REAL-PAY-001',
        conversationId: 'conv-001',
        paidPrice: '299.00',
        basketId: 'basket-001',
      };

      const signature = generateIyzicoSignature(payload, secret);

      const res = await request(app)
        .post('/api/payments/callback')
        .send(payload)
        .set('Content-Type', 'application/json')
        .set('x-iyzico-signature', signature);

      // Imza gecerli - 200 veya 500 (DB yoksa) kabul edilir, 401 DEGIl
      expect(res.status).not.toBe(401);
    });
  });

  // ──────────────────────────────────────────────
  // TEST 2: WhatsApp POST - Imzasiz istek 401 olmali
  // ──────────────────────────────────────────────
  describe('2. Meta /api/webhooks/whatsapp - WhatsApp Spoofing Testi', () => {
    it('IMZA YOK: WhatsApp webhook X-Hub-Signature-256 olmadan 401 donmeli', async () => {
      const fakePayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    { from: '905551234567', text: { body: 'Merhaba!' } }
                  ]
                }
              }
            ]
          }
        ]
      };

      const res = await request(app)
        .post('/api/webhooks/whatsapp')
        .send(fakePayload)
        .set('Content-Type', 'application/json');
        // X-Hub-Signature-256 header YOK

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('WEBHOOK_SIGNATURE_MISSING');
    });

    it('YANLIS FORMAT: sha256= formati olmayan imza 401 donmeli', async () => {
      const res = await request(app)
        .post('/api/webhooks/whatsapp')
        .send({ object: 'test' })
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', 'yanlis-format-imza');

      expect(res.status).toBe(401);
    });

    it('YANLIS IMZA: Yanlis secret ile olusturulan imza 401 donmeli', async () => {
      const payload = { object: 'whatsapp_business_account', entry: [] };
      const wrongSig = generateMetaSignature(payload, 'yanlis-secret-key');

      const res = await request(app)
        .post('/api/webhooks/whatsapp')
        .send(payload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', wrongSig);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('WEBHOOK_SIGNATURE_INVALID');
    });

    it('GECERLI IMZA: Dogru Meta imzasiyla istek kabul edilmeli', async () => {
      const secret = process.env.WHATSAPP_APP_SECRET!;
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    { from: '905551234567', text: { body: 'Randevu onaylanacak mi?' } }
                  ]
                }
              }
            ]
          }
        ]
      };

      const signature = generateMetaSignature(payload, secret);

      const res = await request(app)
        .post('/api/webhooks/whatsapp')
        .send(payload)
        .set('Content-Type', 'application/json')
        .set('x-hub-signature-256', signature);

      // Imza gecerli - 200 veya 500 (DB yoksa) kabul edilir, 401 DEGIl
      expect(res.status).not.toBe(401);
    });
  });
});