import path from 'path';
import dotenv from 'dotenv';
// dotenv.config() tüm import'lardan ÖNCE çalıştırılmalı ki Prisma DATABASE_URL'yi bulabilsin.
// Monorepo kök .env dosyasını açıkça hedefliyoruz.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import { tenantMiddleware, requireTenant } from './middlewares/tenant';
import adminRouter from './routes/admin';
import appointmentsRouter from './routes/appointments';
import customersRouter from './routes/customers';
import financeRouter from './routes/finance';
import servicesRouter from './routes/services';
import galleryRouter from './routes/gallery';
import staffRouter from './routes/staff';
import paymentsRouter from './routes/payments';
import couponsRouter from './routes/coupons';
import tenantCouponsRouter from './routes/tenant-coupons';
import publicLandingRouter from './routes/publicLanding';
import webhooksRouter from './routes/webhooks';
import { captureRawBody } from './middlewares/webhookSignature';
import uploadRouter from './routes/upload';
import directoryRouter from './routes/directory';
import { getTenantPrisma, prisma } from '@kuafor-art/database';
import { ApiResponse } from '@kuafor-art/shared-types';
import { slugify } from './utils/slugify';

// BullMQ Worker'ı başlatmak için import ediyoruz
import './workers/notificationWorker';
// Gecelik Fatura Kontrol Worker'ını başlatmak için import ediyoruz
import './workers/billingWorker';
// Randevu Hatırlatıcı ve Google Yorum Worker'ını başlatmak için import ediyoruz
import './workers/appointmentReminderWorker';
// Günlük Otomatik Pazarlama Kampanya Worker'ını başlatmak için import ediyoruz
import './workers/marketingWorker';

// Kuyruğa iş ekleme fonksiyonu
import { addNotificationJob } from './queues/notificationQueue';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { requireAuth, requireTenantAdmin, requireSuperAdmin, JWT_SECRET } from './middlewares/auth';
import { initializeWhatsAppClient } from './services/whatsapp';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Check Rotaları (Vercel & İzleme Araçları için)
app.get(['/', '/health', '/api/health'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Kuafor.art API Server is running successfully',
    timestamp: new Date().toISOString(),
  });
});

// Webhook rotalarını kiracı domain kontrolünden muaf tutmak için en üste ekliyoruz
// captureRawBody: Imza dogrulama icin ham body'yi yakaliyoruz (express.json() oncesinde)
app.use('/api/webhooks', captureRawBody, webhooksRouter);
// Iyzico/PayTR callback route'u da ayni sekilde ham body yakalama gerektirir
app.use('/api/payments', captureRawBody);

// BigInt JSON serialize desteği — Prisma BigInt alanları (mediaCapacity vb.) JSON'a dönüştürülür
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Tüm isteklere otomatik Kiracı tespiti middleware'ini uygula
app.use(tenantMiddleware);

// ==========================================
// 1. SUPER ADMIN ROTASI (Kiracı bağımsız)
// ==========================================
// Uploads klasörünü dışarıya statik olarak aç
// GÜVENLİK: Dosyalar tenant-izolasyonlu alt dizinlerde saklanır: uploads/{tenantId}/{filename}
// Bu sayede /uploads/{tenantId}/{filename} URL'si doğrudan ilgili tenant dizininden sunulur.
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

app.use('/api/public', publicLandingRouter);
app.use('/api/directory', directoryRouter);
app.use('/api/admin', requireAuth, requireSuperAdmin, adminRouter);

// ==========================================
// 2. KİRACI (SALON) ROTATI (İzolasyonlu ve requireTenant korumalı)
// ==========================================

app.use('/api/finance', requireAuth, requireTenantAdmin, financeRouter);
app.use('/api/appointments', appointmentsRouter); // Public (storefront) + admin (requires separate auth)
app.use('/api/customers', requireAuth, requireTenantAdmin, customersRouter);
app.use('/api/services', requireAuth, requireTenantAdmin, servicesRouter);
app.use('/api/gallery', requireAuth, requireTenantAdmin, galleryRouter);
app.use('/api/upload', requireAuth, requireTenantAdmin, uploadRouter);
app.use('/api/staff', requireAuth, requireTenantAdmin, staffRouter);
app.use('/api/tenant-coupons', tenantCouponsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/coupons', couponsRouter);

// Mağaza Ayarları GET/PUT
app.get('/api/settings', requireAuth, requireTenantAdmin, async (req: any, res: any) => {
  try {
    const tenantPrisma = getTenantPrisma(req.tenant.id);
    let settings = await tenantPrisma.tenantSettings.findFirst();

    if (!settings) {
      // Eğer ayar kaydı yoksa, varsayılan bir tane oluştur
      settings = await tenantPrisma.tenantSettings.create({
        data: {
          tenantId: req.tenant.id,
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: false,
          noShowLimit: 1,
          requiredDepositAmount: 100.00,
          globalPaymentPolicy: 'DEPOSIT',
          themeTemplate: 'template-minimalist'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: settings
    } as ApiResponse);
  } catch (error: any) {
    console.error('[GetSettings] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Mağaza ayarları getirilemedi.' }
    } as ApiResponse);
  }
});

app.put('/api/settings', requireAuth, requireTenantAdmin, async (req: any, res: any) => {
  const { globalPaymentPolicy, emailEnabled, smsEnabled, whatsappEnabled, preferredNotificationChannel, noShowLimit, requiredDepositAmount, themeTemplate, storefrontMode, selectedThemeId } = req.body;
  try {
    const tenantPrisma = getTenantPrisma(req.tenant.id);
    const existing = await tenantPrisma.tenantSettings.findFirst();

    let updated;
    if (existing) {
      updated = await tenantPrisma.tenantSettings.update({
        where: { id: existing.id },
        data: {
          globalPaymentPolicy: globalPaymentPolicy !== undefined ? globalPaymentPolicy : existing.globalPaymentPolicy,
          emailEnabled: emailEnabled !== undefined ? emailEnabled : existing.emailEnabled,
          smsEnabled: smsEnabled !== undefined ? smsEnabled : existing.smsEnabled,
          whatsappEnabled: whatsappEnabled !== undefined ? whatsappEnabled : existing.whatsappEnabled,
          preferredNotificationChannel: preferredNotificationChannel !== undefined ? preferredNotificationChannel : existing.preferredNotificationChannel,
          noShowLimit: noShowLimit !== undefined ? noShowLimit : existing.noShowLimit,
          requiredDepositAmount: requiredDepositAmount !== undefined ? requiredDepositAmount : existing.requiredDepositAmount,
          themeTemplate: themeTemplate !== undefined ? themeTemplate : existing.themeTemplate,
          storefrontMode: storefrontMode !== undefined ? storefrontMode : existing.storefrontMode,
          selectedThemeId: selectedThemeId !== undefined ? selectedThemeId : existing.selectedThemeId,
        }
      });
    } else {
      updated = await tenantPrisma.tenantSettings.create({
        data: {
          tenantId: req.tenant.id,
          globalPaymentPolicy: globalPaymentPolicy || 'DEPOSIT',
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
          whatsappEnabled: whatsappEnabled !== undefined ? whatsappEnabled : false,
          preferredNotificationChannel: preferredNotificationChannel || 'WHATSAPP',
          noShowLimit: noShowLimit !== undefined ? noShowLimit : 1,
          requiredDepositAmount: requiredDepositAmount !== undefined ? requiredDepositAmount : 100.00,
          themeTemplate: themeTemplate || 'template-minimalist',
          storefrontMode: storefrontMode || 'SIMPLE',
          selectedThemeId: selectedThemeId || 'SIMPLE_MINIMALIST'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    } as ApiResponse);
  } catch (error: any) {
    console.error('[UpdateSettings] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Mağaza ayarları güncellenemedi.' }
    } as ApiResponse);
  }
});

// Medya Yükleme Kapasite Kontrolü
app.get('/api/media/capacity', requireAuth, requireTenantAdmin, async (req: any, res: any) => {
  try {
    const tenantPrisma = getTenantPrisma(req.tenant.id);

    // Kiracının tüm medya dosyalarının boyutunu topla
    const mediaAggregation = await tenantPrisma.media.aggregate({
      _sum: {
        fileSize: true
      }
    });

    const usedBytes = mediaAggregation._sum.fileSize ?? 0;
    const maxCapacityBytes = req.tenant.mediaCapacity;

    res.json({
      success: true,
      data: {
        usedBytes,
        maxCapacity: maxCapacityBytes,
        availableBytes: Math.max(0, maxCapacityBytes - usedBytes)
      }
    } as ApiResponse);
  } catch (error: any) {
    console.error('[MediaCapacity] Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Veritabanı işlemi gerçekleştirilemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 2.5 DİZİN ALAN ADI ÇÖZÜMLEME (GET /api/storefront/resolve-domain)
// ==========================================
app.get('/api/storefront/resolve-domain', async (req: any, res: any) => {
  const host = req.query.host as string;
  if (!host) {
    return res.status(400).json({ success: false, error: { message: 'Host query parameter is required.' } });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { customDomain: host },
      select: { slug: true }
    });

    if (tenant) {
      return res.json({ success: true, slug: tenant.slug });
    }
    return res.json({ success: false, error: { message: 'Tenant not found for custom domain.' } });
  } catch (error: any) {
    console.error('[ResolveDomain] Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Database query failed.' } });
  }
});

// ==========================================
// 2.6 MERKEZİ GİRİŞ (POST /api/auth/login)
// ==========================================
app.post('/api/auth/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: { message: 'E-posta ve şifre zorunludur.' } });
  }

  try {
    // SUPER_ADMIN kontrolü: global user tablosunda ara
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        tenant: {
          select: { id: true, name: true, slug: true, isActive: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'E-posta veya şifre hatalı.' } });
    }

    // Şifre doğrulama (bcrypt)
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: { message: 'E-posta veya şifre hatalı.' } });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: { message: 'Bu hesap askıya alınmıştır.' } });
    }

    // Tenant aktiflik kontrolü (SUPER_ADMIN için tenant olmayabilir)
    if (user.role !== 'SUPER_ADMIN' && user.tenant && !user.tenant.isActive) {
      return res.status(403).json({ success: false, error: { message: 'Bağlı olduğunuz salon hesabı askıya alınmıştır.' } });
    }

    // JWT Oluşturma
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        tenantId: user.tenantId || null,
        email: user.email,
        tenantSlug: user.tenant?.slug || null
      },
      JWT_SECRET,
      { expiresIn: '7d' } // 7 gün geçerli oturum
    );

    return res.json({
      success: true,
      data: {
        token,
        role: user.role,
        tenantId: user.tenantId || null,
        name: user.name,
        email: user.email,
        tenantSlug: user.tenant?.slug || null
      }
    });
  } catch (error: any) {
    console.error('[Login] Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Giriş sırasında sunucu hatası oluştu.' } });
  }
});

// ==========================================
// 2.65 KENDİ BİLGİLERİNİ GETIR (GET /api/auth/me)
// Dashboard bileşenlerinin kendi tenant bilgilerine güvenli erişimi için.
// requireAuth middleware'i JWT'yi doğrular; tenantId eşleşmesini de kontrol eder.
// ==========================================
app.get('/api/auth/me', requireAuth, async (req: any, res: any) => {
  try {
    const { userId, tenantId, role, email, tenantSlug } = req.user;

    // Kullanıcıyı DB'den al (güncel isim için)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subdomain: true,
            isActive: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Kullanıcı bulunamadı.' }
      } as ApiResponse);
    }

    // Tenant aktiflik kontrolü
    if (user.tenant && !user.tenant.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'TENANT_INACTIVE', message: 'Bağlı olduğunuz salon hesabı askıya alınmıştır.' }
      } as ApiResponse);
    }

    return res.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name || null,
        tenantSlug: user.tenant?.slug || null,
        subdomain: user.tenant?.subdomain || null
      }
    } as ApiResponse);
  } catch (error: any) {
    console.error('[AuthMe] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Kullanıcı bilgileri alınamadı.' }
    } as ApiResponse);
  }
});

// ==========================================
// 2.7 YENİ SALON / SAAS ÜYE KAYDI (POST /api/storefront/register)
// ==========================================
app.post('/api/storefront/register', async (req: any, res: any) => {
  const { name, ownerName, phone, email, password, province, district, fullAddress } = req.body;

  if (!name || !ownerName || !phone || !email || !password) {
    return res.status(400).json({ success: false, error: { message: 'Tüm alanlar zorunludur.' } });
  }

  if (!province || !district || !fullAddress) {
    return res.status(400).json({ success: false, error: { message: 'İl, ilçe ve açık adres zorunludur.' } });
  }

  try {
    // 0. E-posta kontrolü
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta adresi deneyin veya giriş yapın.' } });
    }

    // 1. Türkçe karakter normalize edilmiş Slug üret
    let slug = slugify(name);
    if (!slug) {
      slug = `salon-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Benzersizlik kontrolü
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 2. Varsayılan Ücretsiz Abonelik Paketini Bul
    let defaultPlan = await prisma.subscriptionPlan.findFirst({ where: { isFree: true } });
    if (!defaultPlan) {
      defaultPlan = await prisma.subscriptionPlan.findFirst();
    }

    if (!defaultPlan) {
      return res.status(500).json({ success: false, error: { message: 'Sistemde tanımlı abonelik paketi bulunamadı.' } });
    }

    // 3. Kayıt işlemini Transaction ile yap
    const result = await prisma.$transaction(async (tx: any) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          planId: defaultPlan!.id,
          mediaCapacity: defaultPlan!.storageLimitMB * 1024 * 1024,
          isActive: true,
          province: province || null,
          district: district || null,
          fullAddress: fullAddress || null
        }
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash: hashedPassword,
          name: ownerName,
          phone,
          role: 'TENANT',
          isActive: true
        }
      });

      await tx.staff.create({
        data: {
          tenantId: tenant.id,
          name: ownerName,
          title: 'Salon Sahibi',
          phone,
          isActive: true
        }
      });

      await tx.tenantSettings.create({
        data: {
          tenantId: tenant.id,
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: false,
          globalPaymentPolicy: 'NONE',
          themeTemplate: 'template-minimalist'
        }
      });

      return { tenant, user };
    });

    // Otomatik Giriş için JWT Oluşturma
    const token = jwt.sign(
      {
        userId: result.user.id,
        role: result.user.role,
        tenantId: result.tenant.id,
        email: result.user.email,
        tenantSlug: result.tenant.slug
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Kayıt işlemi başarıyla tamamlandı.',
      data: {
        token,
        tenantId: result.tenant.id,
        slug: result.tenant.slug
      }
    } as ApiResponse);
  } catch (error: any) {
    console.error('[StorefrontRegister] Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Kayıt yapılırken bir hata oluştu.' } });
  }
});

// ==========================================
// 2.75 AKTİF ABONELİK PAKETLERİNİ GETİR (GET /api/storefront/plans)
// ==========================================
app.get('/api/storefront/plans', async (req: any, res: any) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    return res.json({ success: true, data: plans } as ApiResponse);
  } catch (error: any) {
    console.error('[StorefrontPlans] Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Paketler yüklenemedi.' } });
  }
});

// ==========================================
// 2.8 SALON PLAN GÜNCELLEME (PUT /api/storefront/tenants/:id/plan)
// ==========================================
app.put('/api/storefront/tenants/:id/plan', requireAuth, requireSuperAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  const { planId } = req.body;

  if (!planId) {
    return res.status(400).json({ success: false, error: { message: 'planId parametresi zorunludur.' } });
  }

  try {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ success: false, error: { message: 'Belirtilen paket bulunamadı.' } });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        planId,
        mediaCapacity: plan.storageLimitMB * 1024 * 1024
      }
    });

    return res.json({
      success: true,
      message: 'Abonelik paketi başarıyla güncellendi.',
      data: updatedTenant
    } as ApiResponse);
  } catch (error: any) {
    console.error('[StorefrontUpdatePlan] Error:', error);
    return res.status(500).json({ success: false, error: { message: 'Plan güncellenemedi.' } });
  }
});

// ==========================================
// 3. VİTRİN (PUBLIC) ROTASI (GET /api/storefront/:slug)
// ==========================================
app.get('/api/storefront/:slug', async (req: any, res: any) => {
  const rawParam = decodeURIComponent(req.params.slug || '').trim();
  const lowerParam = rawParam.toLowerCase();
  const cleanSlug = slugify(rawParam);
  const legacySlug = lowerParam.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    // 1. Kiracıyı esnek ve toleranslı şekilde bul (slug, subdomain, legacy slug, ad)
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: rawParam },
          { slug: lowerParam },
          { slug: cleanSlug },
          { slug: legacySlug },
          { subdomain: rawParam },
          { subdomain: lowerParam },
          { subdomain: cleanSlug },
          { name: { equals: rawParam, mode: 'insensitive' } }
        ]
      },
      include: {
        settings: true,
        plan: true
      }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'TENANT_NOT_FOUND', message: 'Salon bulunamadı.' }
      } as ApiResponse);
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        success: false,
        error: { code: 'TENANT_INACTIVE', message: 'Bu salon aktif değil.' }
      } as ApiResponse);
    }

    const tenantPrisma = getTenantPrisma(tenant.id);

    // 2. Aktif Hizmetleri ve Çalışanları çek
    const services = await tenantPrisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true
      }
    });

    const dbStaffList = await tenantPrisma.staff.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    const staff = dbStaffList.map((s: any) => ({
      id: s.id,
      name: s.name,
      role: s.title || 'Uzman'
    }));

    // 3. Yanıtı dön
    return res.status(200).json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          subdomain: tenant.subdomain,
          customDomain: tenant.customDomain,
          plan: (tenant.plan as any)?.name || 'FREE',
          allowPortalThemes: Boolean((tenant.plan as any)?.allowPortalThemes || (tenant.plan as any)?.name === 'ELITE' || (tenant.plan as any)?.name === 'PRO'),
        },
        settings: tenant.settings,
        services,
        staff
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('[StorefrontAPI] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Salon bilgileri yüklenirken sunucu hatası oluştu.' }
    } as ApiResponse);
  }
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Kuafor.art API Server running on http://0.0.0.0:${PORT}`);
    // Sadece yerel/sunucu ortamında WhatsApp'ı başlat (Vercel serverless desteklemez)
    initializeWhatsAppClient();
  });
}

export default app;
module.exports = app;
