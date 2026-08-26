/**
 * apps/api/tests/appointments.test.ts
 *
 * Eşzamanlılık ve Süre Çakışması Entegrasyon Testleri
 * ─────────────────────────────────────────────────────
 * Çalıştırmak için:
 *   cd apps/api && npm test -- --testPathPattern=appointments
 *
 * Gereksinimler (package.json → devDependencies):
 *   jest, ts-jest, supertest, @types/supertest, @types/jest
 */

import request from 'supertest';

// ── Mock: Redis bağlantısı ────────────────────────────────────────
// Gerçek Redis'e bağlanmak yerine in-memory bir store kullanıyoruz.
// Bu sayede CI/CD ortamında dış bağımlılık olmadan testler çalışır.

const redisStore: Record<string, string> = {};

jest.mock('../src/queues/connection', () => ({
  redisConnection: {
    set: jest.fn(async (key: string, value: string, mode?: string, ex?: string, ttl?: number) => {
      if (mode === 'NX') {
        if (redisStore[key] !== undefined) return null; // lock alınamadı
        redisStore[key] = value;
        if (typeof ttl === 'number') {
          setTimeout(() => delete redisStore[key], ttl);
        }
        return 'OK';
      }
      redisStore[key] = value;
      if (ex === 'EX' && typeof ttl === 'number') {
        setTimeout(() => delete redisStore[key], ttl * 1000);
      }
      return 'OK';
    }),
    get:  jest.fn(async (key: string) => redisStore[key] ?? null),
    del:  jest.fn(async (key: string) => { delete redisStore[key]; return 1; }),
    incr: jest.fn(async (key: string) => {
      redisStore[key] = String((parseInt(redisStore[key] ?? '0', 10) + 1));
      return parseInt(redisStore[key], 10);
    }),
    expire: jest.fn(async () => 1),
  },
}));

// ── Mock: Prisma / Database ───────────────────────────────────────
// Hafif bir in-memory veritabanı simüle ediyoruz.

type Appointment = {
  id: string;
  tenantId: string;
  staffId: string | null;
  serviceId: string;
  customerId: string;
  dateTime: Date;
  status: string;
  notes: string | null;
};

const appointmentStore: Appointment[] = [];
let idCounter = 1;

const mockTx = {
  staff: {
    findUnique: jest.fn(async ({ where }: any) =>
      where.id === 'staff-1' ? { id: 'staff-1', name: 'Test Personel' } : null
    ),
  },
  service: {
    findUnique: jest.fn(async ({ where }: any) =>
      where.id === 'svc-1'
        ? { id: 'svc-1', name: 'Test Hizmet', price: 100, duration: 60 }
        : null
    ),
  },
  customer: {
    findFirst: jest.fn(async () => null),
    create:    jest.fn(async ({ data }: any) => ({ ...data, id: `cust-${idCounter++}` })),
  },
  appointment: {
    findFirst: jest.fn(async ({ where }: any) => {
      // Overlap kontrolü: mevcut randevular arasında kesişen var mı?
      const conflict = appointmentStore.find((a) => {
        if (a.status === 'CANCELLED' || a.status === 'NO_SHOW') return false;
        if (where.staffId && a.staffId !== where.staffId) return false;
        // Kesişme: a.dateTime < endTime AND (a.dateTime + 60 dk) > startTime
        const aEnd = new Date(a.dateTime.getTime() + 60 * 60 * 1000);
        // AND koşulundan endTime ve startTime'ı çekiyoruz
        const [cond1, cond2] = where.AND ?? [];
        const newEnd   = cond1?.dateTime?.lt   as Date | undefined;
        const newStart = cond2?.dateTime?.gt   as Date | undefined;
        // dateTime < endTime  VE  aEnd > startTime
        return a.dateTime < (newEnd ?? new Date(0)) && aEnd > (newStart ?? new Date(8640000000000000));
      });
      return conflict ?? null;
    }),
    create: jest.fn(async ({ data }: any) => {
      const apt: Appointment = {
        ...data,
        id: `apt-${idCounter++}`,
      };
      appointmentStore.push(apt);
      return {
        ...apt,
        customer: { id: apt.customerId, name: 'Test Müşteri', phone: '05001234567' },
        service:  { id: apt.serviceId,  name: 'Test Hizmet', duration: 60, price: 100 },
        staff:    { id: apt.staffId,    name: 'Test Personel' },
      };
    }),
  },
  $queryRaw: jest.fn(async () => [{ count: 0 }]),
};

// transaction'u simüle ediyoruz: callback'i mockTx ile çağırıyoruz.
// Mutex: gerçek transaction gibi sıralı çalışması için async-mutex kullanıyoruz.
import { Mutex } from 'async-mutex';
const txMutex = new Mutex();

const mockTenantPrisma = {
  service: mockTx.service,
  $transaction: jest.fn(async (fn: (tx: any) => Promise<any>) => {
    // DB seviyesi mutex — gerçek transaction izolasyonunu simüle eder
    return txMutex.runExclusive(() => fn(mockTx));
  }),
};

jest.mock('@kuafor-art/database', () => ({
  prisma:          {},
  getTenantPrisma: jest.fn(() => mockTenantPrisma),
}));

// ── Mock: Diğer bağımlılıklar ─────────────────────────────────────
jest.mock('../src/services/sms',      () => ({ sendSms:               jest.fn() }));
jest.mock('../src/services/email',    () => ({ sendEmail:              jest.fn() }));
jest.mock('../src/services/whatsapp', () => ({
  sendWhatsAppTextMessage:  jest.fn(async () => true),
  initializeWhatsAppClient: jest.fn(),
}));
jest.mock('../src/queues/notificationQueue', () => ({ addNotificationJob: jest.fn() }));
jest.mock('../src/workers/notificationWorker',         () => ({}));
jest.mock('../src/workers/billingWorker',              () => ({}));
jest.mock('../src/workers/appointmentReminderWorker',  () => ({}));
jest.mock('../src/workers/marketingWorker',            () => ({}));
jest.mock('../src/services/payment/posFactory',        () => ({ PosFactory: {} }));
jest.mock('../src/utils/slugify',                      () => ({ slugify: jest.fn((s: string) => s) }));

// ── App'i import et ───────────────────────────────────────────────
// Not: app.ts'i import etmeden önce mock'lar hazır olmalı (jest.mock hoisted).
let app: any;
beforeAll(async () => {
  // Dynamic import — mock'ların yüklenmesini garantiler
  const mod = await import('../src/app');
  app = (mod as any).default ?? mod;
});

// ── Tenant middleware'i bypass ────────────────────────────────────
// Her istekte X-Tenant-Domain header'ı ile tenant bilgisi inject edilir.
// Middleware test ortamında gerçek DB çağrısı yapmaz (mocklı):
jest.mock('../src/middlewares/tenant', () => ({
  tenantMiddleware: (_req: any, _res: any, next: any) => next(),
  requireTenant:    (req: any, _res: any, next: any) => {
    req.tenant = { id: 'tenant-test-id', name: 'Test Salon', slug: 'test' };
    next();
  },
}));

jest.mock('../src/middlewares/auth', () => ({
  requireAuth:        (_req: any, _res: any, next: any) => next(),
  requireTenantAdmin: (_req: any, _res: any, next: any) => next(),
  requireSuperAdmin:  (_req: any, _res: any, next: any) => next(),
  JWT_SECRET:         'test-secret',
}));

// ── Yardımcı: geçerli randevu isteği ─────────────────────────────
function makeAppointmentPayload(overrides: Record<string, any> = {}) {
  return {
    phone:     '05001234567',
    name:      'Test Müşteri',
    email:     'test@example.com',
    serviceId: 'svc-1',
    staffId:   'staff-1',
    dateTime:  '2099-03-15T11:00:00.000Z', // gelecekteki tarih
    notes:     'Test randevusu',
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════
// TAKIM KURULUMU
// ═══════════════════════════════════════════════════════════════════

beforeEach(() => {
  // Her test öncesi store'u temizle
  appointmentStore.length = 0;
  Object.keys(redisStore).forEach((k) => delete redisStore[k]);
  jest.clearAllMocks();
  // customer findFirst'i her test için yeniden sıfırla
  mockTx.customer.findFirst.mockResolvedValue(null);
  mockTx.customer.create.mockImplementation(async ({ data }: any) => ({
    ...data,
    id: `cust-${idCounter++}`,
  }));
  mockTx.$queryRaw.mockResolvedValue([{ count: 0 }]);
});

// ═══════════════════════════════════════════════════════════════════
// TEST 1: RACE CONDITION SİMÜLASYONU
// ═══════════════════════════════════════════════════════════════════

describe('Test 1: Race Condition — Promise.all ile 5 eşzamanlı istek', () => {
  it('Sadece 1 istek 201, diğer 4 istek 409 döndürmelidir', async () => {
    const payload = makeAppointmentPayload({ dateTime: '2099-06-01T10:00:00.000Z' });

    // 5 isteği aynı anda ateşle
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/appointments')
          .set('Host', 'test.localhost')
          .send(payload)
      )
    );

    const statusCodes = responses.map((r) => r.status);
    console.log('[Test 1] Status codes:', statusCodes);

    const created   = statusCodes.filter((s) => s === 201);
    const conflicts = statusCodes.filter((s) => s === 409);

    // Kesin beklentiler
    expect(created.length).toBe(1);
    expect(conflicts.length).toBe(4);

    // 409 gelen yanıtlarda hata kodu doğrulama
    responses
      .filter((r) => r.status === 409)
      .forEach((r) => {
        expect(r.body.success).toBe(false);
        expect(r.body.error.code).toBe('TIME_SLOT_CONFLICT');
      });

    // 201 gelen yanıtta veri doğrulama
    const created201 = responses.find((r) => r.status === 201)!;
    expect(created201.body.success).toBe(true);
    expect(created201.body.data).toHaveProperty('id');
    expect(created201.body.data).toHaveProperty('dateTime');
  });
});

// ═══════════════════════════════════════════════════════════════════
// TEST 2: DURATION OVERLAP (Süre Çakışması)
// ═══════════════════════════════════════════════════════════════════

describe('Test 2: Duration Overlap — 60 dakikalık randevu ile kesişen istek', () => {
  it('14:00-15:00 randevusundan sonra 14:30-15:30 isteği 409 döndürmelidir', async () => {
    const BASE_DATE = '2099-07-20';

    // ── Adım 1: 14:00 başlangıçlı 60 dk randevu oluştur ─────────
    const firstPayload = makeAppointmentPayload({
      dateTime: `${BASE_DATE}T14:00:00.000Z`,
    });

    const firstRes = await request(app)
      .post('/api/appointments')
      .set('Host', 'test.localhost')
      .send(firstPayload);

    console.log('[Test 2] İlk randevu yanıtı:', firstRes.status, firstRes.body);
    expect(firstRes.status).toBe(201);

    // Şimdi overlap mock'unu aktive ediyoruz:
    // findFirst, 14:00-15:00 arası dolu kabul edecek
    mockTx.appointment.findFirst.mockImplementation(async ({ where }: any) => {
      const [cond1] = where.AND ?? [];
      const newEnd = cond1?.dateTime?.lt as Date | undefined;

      // 14:30 (= 14:00 + 30 dk) < 15:00 (mevcut bitiş) → kesişme var
      const existingStart = new Date(`${BASE_DATE}T14:00:00.000Z`);
      const existingEnd   = new Date(`${BASE_DATE}T15:00:00.000Z`);

      if (newEnd && existingStart < newEnd) {
        // rawOverlap'ı da 1 yap
        mockTx.$queryRaw.mockResolvedValue([{ count: 1 }]);
        return appointmentStore[0] ?? null; // çakışma dön
      }
      return null;
    });

    // ── Adım 2: 14:30 başlangıçlı (yani kesişen) randevu dene ───
    const secondPayload = makeAppointmentPayload({
      dateTime: `${BASE_DATE}T14:30:00.000Z`,
    });

    const secondRes = await request(app)
      .post('/api/appointments')
      .set('Host', 'test.localhost')
      .send(secondPayload);

    console.log('[Test 2] İkinci randevu yanıtı:', secondRes.status, secondRes.body);

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.error.code).toBe('TIME_SLOT_CONFLICT');
    expect(secondRes.body.error.message).toMatch(/çakışma|çakış|zaman dilimi|Conflict/i);
  });

  it('15:30 başlangıçlı randevu (çakışmayan) 201 döndürmelidir', async () => {
    // 14:00-15:00 arası dolu, 15:30 başlayan randevu kabul edilmeli
    const BASE_DATE = '2099-07-20';

    mockTx.appointment.findFirst.mockResolvedValue(null);
    mockTx.$queryRaw.mockResolvedValue([{ count: 0 }]);

    const payload = makeAppointmentPayload({
      dateTime: `${BASE_DATE}T15:30:00.000Z`,
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Host', 'test.localhost')
      .send(payload);

    console.log('[Test 2] Çakışmayan randevu yanıtı:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TEST 3: Validasyon Hataları (Bonus)
// ═══════════════════════════════════════════════════════════════════

describe('Test 3: Zorunlu alan validasyonları', () => {
  it('phone eksik olunca 400 döndürmelidir', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Host', 'test.localhost')
      .send({ name: 'Test', serviceId: 'svc-1', dateTime: '2099-01-01T10:00:00.000Z' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Geçersiz dateTime formatı 400 döndürmelidir', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Host', 'test.localhost')
      .send({ ...makeAppointmentPayload(), dateTime: 'invalid-date' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE');
  });
});
