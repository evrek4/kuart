/**
 * apps/api/tests/garbageCollection.test.ts
 *
 * Aşama 4 - Garbage Collection & Yetim Dosya (Orphaned Files) Koruması Testleri
 *
 * Test 1 (Tam Temizlik): Tenant silindiğinde fiziksel uploads klasörü de silinmeli
 * Test 2 (Hata Toleransı): Klasörü olmayan Tenant silinebilmeli, hata oluşmamalı
 * Test 3 (R2 GC): R2 credentials yoksa R2 adımı sessizce pas geçilmeli
 * Test 4 (Non-blocking): Dosya silme hatası DB silmeyi engellememeliî
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// ──────────────────────────────────────────────────────────────
// Mock: @kuafor-art/database
// ──────────────────────────────────────────────────────────────
const mockTenantFindUnique = jest.fn();
const mockTenantDelete = jest.fn();

jest.mock('@kuafor-art/database', () => ({
  prisma: {
    tenant: {
      findUnique: (...args: any[]) => mockTenantFindUnique(...args),
      delete: (...args: any[]) => mockTenantDelete(...args),
    },
  },
  getTenantPrisma: jest.fn(),
  PrismaClient: jest.fn(),
}));

// ──────────────────────────────────────────────────────────────
// Mock: R2 Client (AWS SDK S3)
// storageService içindeki r2Client'ı mock'luyoruz
// ──────────────────────────────────────────────────────────────
const mockR2Send = jest.fn();

jest.mock('../src/lib/r2', () => ({
  r2Client: { send: (...args: any[]) => mockR2Send(...args) },
  s3Client: { send: (...args: any[]) => mockR2Send(...args) },
  default: { send: (...args: any[]) => mockR2Send(...args) },
}));

// ──────────────────────────────────────────────────────────────
// Mock: Redis / Queues (admin.ts import ağacı için)
// ──────────────────────────────────────────────────────────────
const redisStore: Record<string, string> = {};
jest.mock('../src/queues/connection', () => ({
  redisConnection: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

// Workers'ları pasifleştir
jest.mock('../src/workers/notificationWorker', () => ({}));
jest.mock('../src/workers/billingWorker', () => ({}));
jest.mock('../src/workers/appointmentReminderWorker', () => ({}));
jest.mock('../src/workers/marketingWorker', () => ({}));
jest.mock('../src/services/whatsapp', () => ({
  initializeWhatsAppClient: jest.fn(),
}));

import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import adminRouter from '../src/routes/admin';
import { JWT_SECRET } from '../src/middlewares/auth';
import { deleteTenantStorage } from '../src/services/storageService';

// ──────────────────────────────────────────────────────────────
// Test App Kurulumu
// ──────────────────────────────────────────────────────────────
function buildAdminTestApp(): Express {
  const app = express();
  app.use(express.json());

  // SUPER_ADMIN auth mock
  app.use((req: any, _res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      try {
        req.user = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET) as any;
        req.tenant = { id: req.user.tenantId };
      } catch {}
    }
    next();
  });

  app.use('/api/admin', adminRouter);
  return app;
}

// ──────────────────────────────────────────────────────────────
// Yardımcı: Geçici test uploads dizini oluştur
// ──────────────────────────────────────────────────────────────
function createTempUploadsDir(tenantId: string): string {
  // process.cwd() yerine os.tmpdir() kullanarak test ortamını izole ediyoruz
  // Gerçek servis public/uploads/{tenantId}/ kullanır
  const tmpBase = path.join(os.tmpdir(), `kuart-gc-test-${Date.now()}`);
  const tenantDir = path.join(tmpBase, tenantId);
  fs.mkdirSync(tenantDir, { recursive: true });
  return tmpBase;
}

// ──────────────────────────────────────────────────────────────
// TESTLER
// ──────────────────────────────────────────────────────────────
describe('Garbage Collection - Yetim Dosya Koruması Testleri', () => {

  let superAdminToken: string;

  beforeAll(() => {
    superAdminToken = jwt.sign(
      { userId: 'super-1', tenantId: 'system', role: 'SUPER_ADMIN' },
      JWT_SECRET
    );
    // R2 credentials yoksa R2 adımı pas geçilir
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockR2Send.mockResolvedValue({ Contents: [], IsTruncated: false });
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 1: Fiziksel Dosya Temizliği (deleteTenantStorage - Unit Test)
  // ──────────────────────────────────────────────────────────────
  describe('1. deleteTenantStorage - Yerel Disk Temizliği', () => {

    it(
      'TAM TEMİZLİK: Tenant klasörü ve içindeki dosyalar silinmeli',
      async () => {
        const tenantId = `tenant-gc-test-${Date.now()}`;

        // Geçici bir uploads dizini oluştur: /tmp/.../uploads/{tenantId}/gallery/
        const tmpRoot = os.tmpdir();
        const uploadsDir = path.join(tmpRoot, 'public', 'uploads', tenantId, 'gallery');
        fs.mkdirSync(uploadsDir, { recursive: true });

        // Sahte .jpg dosyası yaz
        const fakeFile = path.join(uploadsDir, 'test-photo.jpg');
        fs.writeFileSync(fakeFile, Buffer.from('FAKE_JPEG_DATA'));

        // Dosyanın var olduğunu doğrula
        expect(fs.existsSync(fakeFile)).toBe(true);
        expect(fs.existsSync(uploadsDir)).toBe(true);

        // process.cwd()'i geçici dizine yönlendir
        const originalCwd = process.cwd;
        process.cwd = () => tmpRoot;

        try {
          // Garbage collection'ı çalıştır
          await deleteTenantStorage(tenantId);

          // Tenant klasörünün tamamen silindiğini doğrula
          const tenantRootDir = path.join(tmpRoot, 'public', 'uploads', tenantId);
          expect(fs.existsSync(tenantRootDir)).toBe(false);
          expect(fs.existsSync(fakeFile)).toBe(false);

          console.log(`[TEST] Doğrulandı: ${tenantRootDir} klasörü silindi ✓`);
        } finally {
          process.cwd = originalCwd;
          // Temizlik (kısmen kalmış olabilir)
          const tenantDir = path.join(tmpRoot, 'public', 'uploads', tenantId);
          if (fs.existsSync(tenantDir)) {
            fs.rmSync(tenantDir, { recursive: true, force: true });
          }
        }
      }
    );

    it(
      'HATA TOLERANSI: Klasörü olmayan Tenant için exception fırlatılmamalı',
      async () => {
        const tenantId = `tenant-no-files-${Date.now()}`;

        const tmpRoot = os.tmpdir();
        const originalCwd = process.cwd;
        process.cwd = () => tmpRoot;

        try {
          // uploads/{tenantId} dizini HİÇ oluşturulmamış
          const tenantDir = path.join(tmpRoot, 'public', 'uploads', tenantId);
          expect(fs.existsSync(tenantDir)).toBe(false);

          // Bu çağrı HATA FIRLATMAmalı — non-blocking olmalı
          await expect(deleteTenantStorage(tenantId)).resolves.not.toThrow();

          console.log('[TEST] Doğrulandı: Klasör olmadan da exception fırlatılmadı ✓');
        } finally {
          process.cwd = originalCwd;
        }
      }
    );

    it(
      'PARALEL GÜVENLİK: R2 credentials yoksa R2 adımı sessizce pas geçilmeli',
      async () => {
        const tenantId = `tenant-no-r2-${Date.now()}`;
        const tmpRoot = os.tmpdir();
        const originalCwd = process.cwd;
        process.cwd = () => tmpRoot;

        delete process.env.R2_ACCESS_KEY_ID;
        delete process.env.R2_SECRET_ACCESS_KEY;

        try {
          await expect(deleteTenantStorage(tenantId)).resolves.not.toThrow();
          // R2 send hiç çağrılmamalı (credentials yoksa)
          expect(mockR2Send).not.toHaveBeenCalled();
        } finally {
          process.cwd = originalCwd;
        }
      }
    );
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 2: Admin DELETE /api/admin/tenants/:id - Entegrasyon
  // ──────────────────────────────────────────────────────────────
  describe('2. DELETE /api/admin/tenants/:id - GC Entegrasyon Testleri', () => {
    let app: Express;

    beforeAll(() => {
      app = buildAdminTestApp();
    });

    it(
      'TAM AKIŞ: Tenant silindiğinde DB delete ve GC birlikte çalışmalı',
      async () => {
        const tenantId = `tenant-full-flow-${Date.now()}`;
        const tmpRoot = os.tmpdir();

        // Mock Tenant kaydı
        mockTenantFindUnique.mockResolvedValue({
          id: tenantId,
          name: 'Test Salonu',
          slug: 'test-salon',
          isActive: true,
        });
        mockTenantDelete.mockResolvedValue({ id: tenantId, name: 'Test Salonu' });

        // Sahte fiziksel dosya oluştur
        const uploadsDir = path.join(tmpRoot, 'public', 'uploads', tenantId);
        fs.mkdirSync(uploadsDir, { recursive: true });
        const fakeFile = path.join(uploadsDir, 'avatar.jpg');
        fs.writeFileSync(fakeFile, Buffer.from('FAKE_IMAGE'));

        // process.cwd mock'u
        const originalCwd = process.cwd;
        process.cwd = () => tmpRoot;

        try {
          const res = await request(app)
            .delete(`/api/admin/tenants/${tenantId}`)
            .set('Authorization', `Bearer ${superAdminToken}`);

          // 200 OK bekliyoruz
          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);

          // DB delete çağrıldı mı?
          expect(mockTenantDelete).toHaveBeenCalledWith({ where: { id: tenantId } });

          // Dosya silme async — kısa bir bekleme ile kontrol et
          await new Promise((resolve) => setTimeout(resolve, 100));
          expect(fs.existsSync(uploadsDir)).toBe(false);

          console.log(`[TEST] Doğrulandı: DELETE 200 OK + DB delete + GC çalıştı ✓`);
        } finally {
          process.cwd = originalCwd;
          if (fs.existsSync(uploadsDir)) {
            fs.rmSync(uploadsDir, { recursive: true, force: true });
          }
        }
      }
    );

    it(
      'HATA TOLERANSI: Fiziksel klasörü olmayan Tenant başarıyla silinmeli (200)',
      async () => {
        const tenantId = `tenant-no-files-flow-${Date.now()}`;

        mockTenantFindUnique.mockResolvedValue({
          id: tenantId,
          name: 'Fotoğrafsız Salon',
          slug: 'fotografsiz-salon',
          isActive: true,
        });
        mockTenantDelete.mockResolvedValue({ id: tenantId, name: 'Fotoğrafsız Salon' });

        const res = await request(app)
          .delete(`/api/admin/tenants/${tenantId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        // Klasör yoksa bile 200 dönmeli
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // DB delete hâlâ çağrılmalı
        expect(mockTenantDelete).toHaveBeenCalledWith({ where: { id: tenantId } });

        console.log('[TEST] Doğrulandı: Fotoğrafsız tenant silme 200 OK + DB delete çalıştı ✓');
      }
    );

    it(
      'GÜVENLİK: Tenant bulunamazsa 404 dönmeli',
      async () => {
        mockTenantFindUnique.mockResolvedValue(null);

        const res = await request(app)
          .delete('/api/admin/tenants/non-existent-id-9999')
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.status).toBe(404);
        expect(mockTenantDelete).not.toHaveBeenCalled();

        console.log('[TEST] Doğrulandı: Bulunamayan tenant 404 ve DB delete çağrılmadı ✓');
      }
    );

    it(
      'NON-BLOCKING: GC hatası ana DB silmeyi engellemememeli',
      async () => {
        const tenantId = `tenant-gc-fail-${Date.now()}`;

        mockTenantFindUnique.mockResolvedValue({
          id: tenantId,
          name: 'GC Fail Salon',
          slug: 'gc-fail-salon',
        });
        mockTenantDelete.mockResolvedValue({ id: tenantId });

        // process.cwd'yi GC hatasına yol açacak şekilde ayarla
        // (yazma iznimiz olmayan bir yol gibi davran — rmSync hata verse de test geçmeli)
        const tmpRoot = os.tmpdir();
        const uploadsDir = path.join(tmpRoot, 'public', 'uploads', tenantId);
        fs.mkdirSync(uploadsDir, { recursive: true });

        const originalCwd = process.cwd;
        process.cwd = () => tmpRoot;

        // rmSync'i hata fırlatacak şekilde mock'la (izin yok simülasyonu)
        const originalRmSync = fs.rmSync;
        const rmSyncSpy = jest.spyOn(fs, 'rmSync').mockImplementationOnce(() => {
          throw new Error('EACCES: permission denied (simulated)');
        });

        try {
          const res = await request(app)
            .delete(`/api/admin/tenants/${tenantId}`)
            .set('Authorization', `Bearer ${superAdminToken}`);

          // GC hatası olsa bile 200 dönmeli — non-blocking
          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);

          // DB delete yine de çağrılmış olmalı
          expect(mockTenantDelete).toHaveBeenCalledWith({ where: { id: tenantId } });

          console.log('[TEST] Doğrulandı: GC hatası DB silmeyi engellemedi ✓');
        } finally {
          rmSyncSpy.mockRestore();
          process.cwd = originalCwd;
          if (fs.existsSync(uploadsDir)) {
            fs.rmSync(uploadsDir, { recursive: true, force: true });
          }
        }
      }
    );
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 3: Prisma Cascade Bütünlüğü (Belgeleme Testi)
  // ──────────────────────────────────────────────────────────────
  describe('3. Prisma Cascade Bütünlüğü Doğrulaması', () => {

    it(
      'DB delete çağrısı tenant ID ile yapılmalı (cascade zinciri başlar)',
      async () => {
        const app = buildAdminTestApp();
        const tenantId = 'tenant-cascade-test';

        mockTenantFindUnique.mockResolvedValue({
          id: tenantId,
          name: 'Cascade Test Salonu',
          slug: 'cascade-test',
        });
        mockTenantDelete.mockResolvedValue({ id: tenantId });

        const res = await request(app)
          .delete(`/api/admin/tenants/${tenantId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.status).toBe(200);

        // Prisma tenant.delete { where: { id } } çağrısı cascade zincirini tetikler:
        // User, Customer, Appointment, Staff, Service, Media, Payment,
        // PaymentHistory, TenantSettings, FinanceRecord, TenantCoupon,
        // LoyaltyCard, MarketingLog, ReviewRequest → onDelete: Cascade
        expect(mockTenantDelete).toHaveBeenCalledWith(
          expect.objectContaining({ where: { id: tenantId } })
        );
      }
    );
  });
});