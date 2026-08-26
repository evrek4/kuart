/**
 * apps/api/tests/finance.test.ts
 *
 * Asama 3 - Finansal Butunluk ve IEEE 754 Floating Point Korumasi Testleri
 *
 * Test 1: Personel prim hesaplamasi - %15 oran, 100.50 TL -> 15.08 TL (veya 15.07)
 * Test 2: IEEE 754 floating point hatasi olusmadiginin dogrulanmasi
 * Test 3: Checkout endpoint entegrasyon testi (staffCommissionEarned dogrulama)
 * Test 4: Sinir deger testleri (0 TL, tam sayi, yuksek tutar)
 */

// @kuafor-art/database mock'u
const mockAppointmentUpdate = jest.fn();
const mockAppointmentFindFirst = jest.fn();
const mockCustomerFindUnique = jest.fn();
const mockTenantFindUnique = jest.fn();
const mockCustomerUpdate = jest.fn();

jest.mock('@kuafor-art/database', () => ({
  prisma: {
    tenant: {
      findFirst: jest.fn().mockResolvedValue({ id: 'tenant-test' }),
    },
  },
  getTenantPrisma: jest.fn().mockReturnValue({
    appointment: {
      findFirst: mockAppointmentFindFirst,
      update: mockAppointmentUpdate,
    },
    customer: {
      findUnique: mockCustomerFindUnique,
      update: mockCustomerUpdate,
    },
    tenant: {
      findUnique: mockTenantFindUnique,
    },
  }),
  PrismaClient: jest.fn(),
}));

import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import appointmentsRouter from '../src/routes/appointments';
import { JWT_SECRET } from '../src/middlewares/auth';
import { redisConnection } from '../src/queues/connection';

// ─────────────────────────────────────────────────
// Test App Kurulumu
// ─────────────────────────────────────────────────
function buildFinanceTestApp(): Express {
  const app = express();
  app.use(express.json());

  // Tenant + Auth mock middleware
  app.use((req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded: any = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded;
        req.tenant = { id: decoded.tenantId };
      } catch {
        return res.status(401).json({ success: false });
      }
    } else {
      req.tenant = { id: req.headers['x-tenant-id'] || 'tenant-test' };
    }
    next();
  });

  app.use('/api/appointments', appointmentsRouter);
  return app;
}

// ─────────────────────────────────────────────────
// Yardimci: IEEE 754 dogrulama
// ─────────────────────────────────────────────────
function safeRound2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ─────────────────────────────────────────────────
// UNIT TESTLER - Komisyon Hesaplama Mantigi
// ─────────────────────────────────────────────────
describe('Finansal Butunluk - IEEE 754 Floating Point Korumasi', () => {

  describe('1. Prim Hesaplama Matematigi (Unit Test)', () => {

    it('IEEE 754 Kaydirma Hatasi: 0.1 + 0.2 orijinal hatali sonucu gostermeli', () => {
      // Bu test JavaScript doganin belgelemek icin var
      const rawResult = 0.1 + 0.2;
      expect(rawResult).not.toBe(0.3); // JavaScript'in bilinen hatasi
      expect(rawResult).toBeCloseTo(0.3, 10); // Yakin ama esit degil
    });

    it('safeRound2 ile 0.1 + 0.2 tam 0.30 olmali', () => {
      const result = safeRound2(0.1 + 0.2);
      expect(result).toBe(0.3);
    });

    it('%15 prim * 100.50 TL = 15.075 -> yuvarlanmis 15.08 TL olmali', () => {
      const paidAmount = 100.50;
      const commissionRate = 15.0; // %15
      
      // Raw hesaplama
      const rawCommission = paidAmount * (commissionRate / 100);
      expect(rawCommission).toBe(15.075); // Tam kesirli - henuz dogru
      
      // Yuvarlanmis hesaplama (sistemimizin yaptigi)
      const rounded = safeRound2(rawCommission);
      expect(rounded).toBe(15.08); // Standart yuvarlama: .5 -> yukari
      
      // Hic bir durumda uzayan ondalik olmamali
      const asString = rounded.toString();
      expect(asString).not.toMatch(/\.\d{3,}/); // 3+ ondalik hane olmamali
    });

    it('%15 prim * 100.10 TL hesaplamasi floating-point guvenli olmali', () => {
      const paidAmount = 100.10;
      const commissionRate = 15.0;
      
      const rawCommission = paidAmount * (commissionRate / 100);
      // 100.10 * 0.15 = 15.015 -> IEEE 754 ile 15.014999... olabilir
      
      const rounded = safeRound2(rawCommission);
      
      // Sonuc 15.01 veya 15.02 olmali (hicbir durumda uzayan ondalik degil)
      expect(rounded).toBeGreaterThanOrEqual(15.01);
      expect(rounded).toBeLessThanOrEqual(15.02);
      expect(Number.isFinite(rounded)).toBe(true);
      
      const asString = rounded.toString();
      expect(asString).not.toMatch(/\.\d{3,}/);
    });

    it('%0 prim orani ile her zaman 0.00 olmali', () => {
      const result = safeRound2(500 * (0 / 100));
      expect(result).toBe(0);
    });

    it('%100 prim orani ile paidAmount kadar olmali', () => {
      const paidAmount = 250.75;
      const result = safeRound2(paidAmount * (100 / 100));
      expect(result).toBe(250.75);
    });

    it('Buyuk tutar: 9999.99 TL * %17.5 = dogru yuvarlanmali', () => {
      const paidAmount = 9999.99;
      const commissionRate = 17.5;
      const result = safeRound2(paidAmount * (commissionRate / 100));
      
      // 9999.99 * 0.175 = 1749.99825 -> 1750.00
      expect(result).toBe(1750.00);
      expect(result.toString()).not.toMatch(/\.\d{3,}/);
    });
  });

  // ─────────────────────────────────────────────────
  // ENTEGRASYON TESTLERI - Checkout Endpoint
  // ─────────────────────────────────────────────────
  describe('2. Checkout Endpoint - staffCommissionEarned Dogrulama', () => {
    let app: Express;
    let authToken: string;

    beforeAll(() => {
      app = buildFinanceTestApp();
      authToken = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-test', role: 'TENANT_ADMIN' },
        JWT_SECRET
      );
    });

    afterAll(async () => {
      await redisConnection.quit();
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it(
      'KRITIK: %15 komisyon - 100.50 TL islem -> staffCommissionEarned tam 15.08 olmali',
      async () => {
        // Mock randevu: staff %15 komisyon oranina sahip
        mockAppointmentFindFirst.mockResolvedValue({
          id: 'appt-001',
          tenantId: 'tenant-test',
          customerId: 'cust-001',
          staffId: 'staff-001',
          status: 'CONFIRMED',
          staff: {
            id: 'staff-001',
            name: 'Ahmet Usta',
            commissionRate: 15.0, // %15
          },
        });

        let capturedCommission: number | null = null;

        mockAppointmentUpdate.mockImplementation(({ data }: any) => {
          capturedCommission = data.staffCommissionEarned;
          return {
            id: 'appt-001',
            isPaid: true,
            status: 'COMPLETED',
            paymentMethod: 'CASH',
            paidAmount: 100.50,
            staffCommissionEarned: data.staffCommissionEarned,
          };
        });

        mockCustomerFindUnique.mockResolvedValue({
          id: 'cust-001',
          name: 'Müşteri Test',
          totalVisits: 5,
          loyaltyStamps: 2,
        });

        mockTenantFindUnique.mockResolvedValue({
          id: 'tenant-test',
          settings: { noShowLimit: 3 },
        });

        mockCustomerUpdate.mockResolvedValue({ id: 'cust-001' });

        const res = await request(app)
          .post('/api/appointments/appt-001/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .set('Content-Type', 'application/json')
          .send({
            paymentMethod: 'CASH',
            paidAmount: 100.50,
          });

        // 401 veya 404 degil, basarili olmali
        expect(res.status).not.toBe(401);
        expect(res.status).not.toBe(403);

        // staffCommissionEarned 15.08 olmali (100.50 * 0.15 = 15.075 -> 15.08)
        expect(capturedCommission).not.toBeNull();
        expect(capturedCommission).toBe(15.08);

        // Uzayan ondalik olmamali
        const asString = capturedCommission!.toString();
        expect(asString).not.toMatch(/\.\d{3,}/);

        console.log(`[TEST] Hesaplanan komisyon: ${capturedCommission} TL (beklenen: 15.08 TL)`);
      }
    );

    it(
      'Sifir komisyon orani olan personel icin staffCommissionEarned 0 olmali',
      async () => {
        mockAppointmentFindFirst.mockResolvedValue({
          id: 'appt-002',
          tenantId: 'tenant-test',
          customerId: 'cust-001',
          staffId: 'staff-002',
          status: 'CONFIRMED',
          staff: {
            id: 'staff-002',
            name: 'Yeni Calisan',
            commissionRate: 0,
          },
        });

        let capturedCommission: number | null = null;

        mockAppointmentUpdate.mockImplementation(({ data }: any) => {
          capturedCommission = data.staffCommissionEarned;
          return { id: 'appt-002', ...data };
        });

        mockCustomerFindUnique.mockResolvedValue(null);
        mockTenantFindUnique.mockResolvedValue({ id: 'tenant-test', settings: null });

        const res = await request(app)
          .post('/api/appointments/appt-002/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ paymentMethod: 'CARD', paidAmount: 200.00 });

        expect(res.status).not.toBe(401);
        expect(capturedCommission).toBe(0);
      }
    );

    it(
      'Personel atanmamis randevuda staffCommissionEarned 0 olmali',
      async () => {
        mockAppointmentFindFirst.mockResolvedValue({
          id: 'appt-003',
          tenantId: 'tenant-test',
          customerId: 'cust-001',
          staffId: null, // Personel yok
          status: 'CONFIRMED',
          staff: null,
        });

        let capturedCommission: number | null = null;

        mockAppointmentUpdate.mockImplementation(({ data }: any) => {
          capturedCommission = data.staffCommissionEarned;
          return { id: 'appt-003', ...data };
        });

        mockCustomerFindUnique.mockResolvedValue(null);
        mockTenantFindUnique.mockResolvedValue({ id: 'tenant-test', settings: null });

        const res = await request(app)
          .post('/api/appointments/appt-003/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ paymentMethod: 'TRANSFER', paidAmount: 350.00 });

        expect(res.status).not.toBe(401);
        expect(capturedCommission).toBe(0);
      }
    );
  });

  // ─────────────────────────────────────────────────
  // TEST 3: Finance Route - staff-commissions
  // ─────────────────────────────────────────────────
  describe('3. Finance Staff Commissions Route - Toplam Prim Hesaplama', () => {

    it('Birden fazla randevu icin toplam prim dogru yuvarlanmali', () => {
      // Simule: 3 randevu, %15 komisyon
      const appointments = [
        { paidAmount: 100.50 },
        { paidAmount: 75.25 },
        { paidAmount: 49.99 },
      ];
      const commissionRate = 15;

      const totalRevenue = appointments.reduce((sum, a) => sum + a.paidAmount, 0);
      // 100.50 + 75.25 + 49.99 = 225.74
      expect(safeRound2(totalRevenue)).toBe(225.74);

      const totalCommission = safeRound2(totalRevenue * (commissionRate / 100));
      // 225.74 * 0.15 = 33.861 -> 33.86
      expect(totalCommission).toBe(33.86);

      // String kontrolu
      expect(totalCommission.toString()).not.toMatch(/\.\d{3,}/);
    });
  });
});