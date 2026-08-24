import { prisma } from '@kuafor-art/database';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

async function runWebhookTests() {
  console.log('\n=============================================================');
  console.log('🧪 Kuafor.art E2E Webhook & Integration Simulation Runner');
  console.log(`🌐 Target API Endpoint: ${API_BASE}`);
  console.log('=============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Helper tester
  const assertTest = (name: string, condition: boolean, details?: string) => {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
      if (details) console.log(`     └─ ${details}`);
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      if (details) console.error(`     └─ ${details}`);
    }
  };

  // 1. PING / LIVENESS TEST
  console.log('-------------------------------------------------------------');
  console.log('1️⃣ TESTING WEBHOOK LIVENESS PING (GET /api/webhooks/test-ping)');
  console.log('-------------------------------------------------------------');
  try {
    const res = await fetch(`${API_BASE}/api/webhooks/test-ping`);
    const json: any = await res.json();
    assertTest('Webhook Test Ping', res.status === 200 && json.success === true, `Response: ${json.message}`);
  } catch (err: any) {
    assertTest('Webhook Test Ping Connection', false, `Sunucu çalışmıyor olabilir: ${err.message}`);
  }

  // 2. WHATSAPP INCOMING MESSAGE WEBHOOK SIMULATION (Meta Cloud API Format)
  console.log('\n-------------------------------------------------------------');
  console.log('2️⃣ TESTING WHATSAPP INCOMING WEBHOOK (POST /api/webhooks/whatsapp)');
  console.log('-------------------------------------------------------------');
  const whatsappPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550555555',
                phone_number_id: '100609346302220'
              },
              contacts: [
                {
                  profile: { name: 'Ayşe Yılmaz' },
                  wa_id: '905329998877'
                }
              ],
              messages: [
                {
                  from: '905329998877',
                  id: 'wamid.HBgLOTA1MzI5OTk4ODc3FQIAERgSQTU1RkY5RjYxNkI1RjU2MEVBAA==',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: 'ONAY' },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(`${API_BASE}/api/webhooks/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(whatsappPayload)
    });
    const json: any = await res.json();
    assertTest('WhatsApp Incoming Webhook Payload Processed', res.status === 200 && json.success === true);
  } catch (err: any) {
    assertTest('WhatsApp Incoming Webhook Request', false, err.message);
  }

  // 3. SMS DELIVERY CALLBACK SIMULATION (Netgsm Callback Format)
  console.log('\n-------------------------------------------------------------');
  console.log('3️⃣ TESTING SMS DELIVERY REPORT CALLBACK SIMULATION');
  console.log('-------------------------------------------------------------');
  const smsCallbackPayload = {
    jobID: '12345678',
    phone: '05329998877',
    status: 'DELIVERED',
    errorCode: '0',
    deliveryTime: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE}/api/webhooks/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsCallbackPayload)
    });
    const json: any = await res.json();
    assertTest('SMS Delivery Callback Simulation', res.status === 200 && json.success === true);
  } catch (err: any) {
    assertTest('SMS Delivery Callback Request', false, err.message);
  }

  // 4. PAYMENT WEBHOOK SIMULATION (3D Secure Iyzico/PayTR Callback Format)
  console.log('\n-------------------------------------------------------------');
  console.log('4️⃣ TESTING PAYMENT WEBHOOK (POST /api/webhooks/payment)');
  console.log('-------------------------------------------------------------');
  const paymentPayload = {
    status: 'success',
    paymentId: 'iyz-test-payment-9988',
    conversationData: 'tenant-demo-slug',
    conversationId: 'booking-app-12345',
    mdStatus: '1',
    price: '350.00',
    paidPrice: '350.00',
    currency: 'TRY'
  };

  try {
    const res = await fetch(`${API_BASE}/api/webhooks/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload)
    });
    const text = await res.text();
    assertTest('Payment Webhook (3D Secure Success Callback)', res.status === 200 && text === 'OK');
  } catch (err: any) {
    assertTest('Payment Webhook Request', false, err.message);
  }

  // 5. DATABASE MARKETING LOG VERIFICATION
  console.log('\n-------------------------------------------------------------');
  console.log('5️⃣ VERIFYING DATABASE MARKETING LOG ENTRIES');
  console.log('-------------------------------------------------------------');
  try {
    const res = await fetch(`${API_BASE}/api/webhooks/logs`);
    const json: any = await res.json();
    assertTest('Database MarketingLog Entry Verification', res.status === 200 && json.count > 0, `Veritabanında ${json.count} adet son WhatsApp webhook kaydı doğrulandı.`);
  } catch (err: any) {
    assertTest('Database MarketingLog Verification', false, err.message);
  }

  // SUMMARY REPORT
  console.log('\n=============================================================');
  console.log(`📊 SIMULATION REPORT: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('=============================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runWebhookTests().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
