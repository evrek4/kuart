import { Router } from 'express';
import { deleteTenantStorage } from '../services/storageService';
import { prisma } from '@kuafor-art/database';
import bcrypt from 'bcrypt';
import { slugify } from '../utils/slugify';

const router = Router();

// In-Memory Database
let plans = [
  {
    id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    name: 'FREE',
    price: 0,
    storageLimitMB: 100,
    features: {
      smsEnabled: false,
      whatsappEnabled: false,
      emailEnabled: true,
      customDomainAllowed: false,
      customPOSAllowed: false
    },
    isFree: true,
    isActive: true
  },
  {
    id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
    name: 'PRO',
    price: 499,
    storageLimitMB: 500,
    features: {
      smsEnabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      customDomainAllowed: false,
      customPOSAllowed: false
    },
    isFree: false,
    isActive: true
  },
  {
    id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    name: 'ELITE',
    price: 999,
    storageLimitMB: 1024,
    features: {
      smsEnabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      customDomainAllowed: true,
      customPOSAllowed: true
    },
    isFree: false,
    isActive: true
  }
];

let tenants = [
  {
    id: 'tenant-123',
    name: 'Art Kuaför',
    slug: 'kuafor-art',
    subdomain: 'kuaforart',
    customDomain: null,
    planId: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    mediaCapacity: 1024 * 1024 * 100, // 100MB
    isActive: true,
    billingStatus: 'ACTIVE',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tenant-456',
    name: 'Melek Kuaför',
    slug: 'melek',
    subdomain: 'melek',
    customDomain: 'melekkuafor.com',
    planId: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    mediaCapacity: 1024 * 1024 * 1024, // 1GB
    isActive: true,
    billingStatus: 'ACTIVE',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let r2Settings = {
  accountId: "mock-r2-account-id",
  accessKey: "mock-access-key-id",
  secretKey: "mock-secret-access-key",
  bucketName: "kuafor-art-assets",
  publicCdnUrl: "https://cdn.kuafor.art"
};

let prismaSettings = {
  smsConfig: {
    provider: "netgsm",
    apiKey: "netgsm-key-xyz-123",
    title: "KuaforArt"
  },
  posConfig: {
    provider: "iyzico",
    apiKey: "iyzico-api-key-abc",
    secretKey: "iyzico-secret-key-def"
  }
};

let systemLogs = [
  { message: "Sistem admin girişi yapıldı.", timestamp: new Date().toISOString() },
  { message: "Melek Kuaför deneme paketi tanımlandı.", timestamp: new Date(Date.now() - 3600000).toISOString() }
];

// Dashboard Data
router.get('/dashboard', (req, res) => {
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.isActive).length;
  const totalRevenue = tenants.reduce((acc, t) => {
    const plan = plans.find(p => p.id === t.planId);
    return acc + (plan ? plan.price : 0);
  }, 0);

  res.json({
    success: true,
    data: {
      totalTenants,
      activeTenants,
      totalRevenue,
      totalMediaBytes: 20485760, // Mock 20MB
      logs: systemLogs
    }
  });
});

// Tenants Endpoints
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        plan: true,
        users: {
          where: { role: 'TENANT' },
          select: { id: true, name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = tenants.map((t: any) => ({
      ...t,
      mediaCapacity: Number(t.mediaCapacity),
      owner: t.users[0] || null
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/tenants', async (req, res) => {
  try {
    const { name, slug, subdomain, customDomain, planId, email, password, ownerName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Salon adı, e-posta ve şifre zorunludur.' } });
    }

    // E-posta benzersizlik kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: { message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.' } });
    }

    const cleanSlug = slug ? slugify(slug) : slugify(name);
    const existingSlug = await prisma.tenant.findUnique({ where: { slug: cleanSlug } });
    if (existingSlug) {
      return res.status(400).json({ success: false, error: { message: 'Bu slug/URL adresi zaten kullanımda.' } });
    }

    // Plan bul veya ilk aktif planı seç
    let targetPlanId = planId;
    if (!targetPlanId) {
      const defaultPlan = await prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
      if (defaultPlan) {
        targetPlanId = defaultPlan.id;
      } else {
        return res.status(400).json({ success: false, error: { message: 'Sistemde tanımlı abonelik paketi bulunamadı.' } });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx: any) => {
      const newTenant = await tx.tenant.create({
        data: {
          name,
          slug: cleanSlug,
          subdomain: subdomain ? slugify(subdomain) : null,
          customDomain: customDomain || null,
          planId: targetPlanId,
          mediaCapacity: 1024 * 1024 * 100, // 100MB default
          isActive: true,
          billingStatus: 'ACTIVE',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        include: { plan: true }
      });

      const ownerUser = await tx.user.create({
        data: {
          tenantId: newTenant.id,
          name: ownerName || name,
          email,
          passwordHash,
          phone: phone || null,
          role: 'TENANT',
          isActive: true
        }
      });

      await tx.tenantSettings.create({
        data: {
          tenantId: newTenant.id
        }
      });

      return { tenant: newTenant, user: ownerUser };
    });

    res.json({
      success: true,
      data: {
        ...result.tenant,
        mediaCapacity: Number(result.tenant.mediaCapacity),
        owner: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone
        }
      }
    });
  } catch (error: any) {
    console.error('[CreateTenant] Error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Salon oluşturulurken hata meydana geldi.' } });
  }
});

router.put('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, slug, subdomain, customDomain, planId, isActive, mediaCapacity, billingStatus,
      ownerName, email, phone, password
    } = req.body;

    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: { users: { where: { role: 'TENANT' } } }
    });

    if (!existingTenant) {
      return res.status(404).json({ success: false, error: { message: 'Salon bulunamadı.' } });
    }

    const tenantUpdateData: any = {};
    if (name !== undefined) tenantUpdateData.name = name;
    if (slug !== undefined) tenantUpdateData.slug = slugify(slug);
    if (subdomain !== undefined) tenantUpdateData.subdomain = subdomain ? slugify(subdomain) : null;
    if (customDomain !== undefined) tenantUpdateData.customDomain = customDomain || null;
    if (planId !== undefined) tenantUpdateData.planId = planId;
    if (isActive !== undefined) tenantUpdateData.isActive = Boolean(isActive);
    if (mediaCapacity !== undefined) tenantUpdateData.mediaCapacity = BigInt(mediaCapacity);
    if (billingStatus !== undefined) tenantUpdateData.billingStatus = billingStatus;

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: tenantUpdateData,
      include: { plan: true }
    });

    const primaryUser = existingTenant.users[0];
    let updatedOwner = null;

    if (primaryUser) {
      const userUpdateData: any = {};
      if (ownerName !== undefined) userUpdateData.name = ownerName;
      if (email !== undefined) userUpdateData.email = email;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (password && password.trim() !== '') {
        userUpdateData.passwordHash = await bcrypt.hash(password.trim(), 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        updatedOwner = await prisma.user.update({
          where: { id: primaryUser.id },
          data: userUpdateData,
          select: { id: true, name: true, email: true, phone: true }
        });
      } else {
        updatedOwner = {
          id: primaryUser.id,
          name: primaryUser.name,
          email: primaryUser.email,
          phone: primaryUser.phone
        };
      }
    } else if (email) {
      const passwordHash = password && password.trim() !== '' 
        ? await bcrypt.hash(password.trim(), 10) 
        : await bcrypt.hash('GeciciSifre123', 10);

      updatedOwner = await prisma.user.create({
        data: {
          tenantId: id,
          name: ownerName || updatedTenant.name,
          email,
          passwordHash,
          phone: phone || null,
          role: 'TENANT',
          isActive: true
        },
        select: { id: true, name: true, email: true, phone: true }
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedTenant,
        mediaCapacity: Number(updatedTenant.mediaCapacity),
        owner: updatedOwner
      }
    });
  } catch (error: any) {
    console.error('[UpdateTenant] Error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Salon güncellenirken hata meydana geldi.' } });
  }
});

router.delete('/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Salon bulunamadı.' } });
    }

    // ADIM 1: Fiziksel dosyaları asenkron sil (R2 CDN + yerel disk)
    // Non-blocking: Hata olsa bile DB silme işlemini engellemez
    deleteTenantStorage(id).catch((gcErr) => {
      console.error('[DeleteTenant] Garbage collection hatasi (non-blocking):', gcErr?.message || gcErr);
    });

    // ADIM 2: Prisma Cascade ile DB kayıtlarını sil
    // onDelete: Cascade → User, Customer, Appointment, Staff, Service,
    //                      Media, Payment, PaymentHistory, TenantSettings,
    //                      FinanceRecord, TenantCoupon, LoyaltyCard,
    //                      MarketingLog, ReviewRequest hepsi silinir
    await prisma.tenant.delete({ where: { id } });

    res.json({
      success: true,
      message: `${existing.name} salonu ve bağlı tüm veriler kalıcı olarak silindi.`
    });
  } catch (error: any) {
    console.error('[DeleteTenant] Error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Salon silinirken hata oluştu.' } });
  }
});

router.post('/tenants/:id/gift', async (req, res) => {
  try {
    const { id } = req.params;
    const { durationType, amount } = req.body;

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ success: false, error: { message: 'Salon bulunamadı.' } });
    }

    const nextDate = new Date(tenant.nextBillingDate || Date.now());
    if (durationType === 'MONTH') {
      nextDate.setMonth(nextDate.getMonth() + Number(amount));
    } else {
      nextDate.setDate(nextDate.getDate() + Number(amount));
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: { nextBillingDate: nextDate },
      include: {
        plan: true,
        users: { where: { role: 'TENANT' }, select: { id: true, name: true, email: true, phone: true } }
      }
    });

    res.json({
      success: true,
      data: {
        ...updated,
        mediaCapacity: Number(updated.mediaCapacity),
        owner: updated.users[0] || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ==========================================
// ÖNE ÇIKARMA (PROMOTE) ENDPOINT
// POST /tenants/:id/promote
// ==========================================
router.post('/tenants/:id/promote', async (req, res) => {
  try {
    const { id } = req.params;
    const { level, days } = req.body;

    if (!level || !['PROVINCE', 'DISTRICT', 'NONE'].includes(level)) {
      return res.status(400).json({ success: false, error: { message: 'Geçerli bir promosyon seviyesi seçin (PROVINCE, DISTRICT veya NONE).' } });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ success: false, error: { message: 'Salon bulunamadı.' } });
    }

    let promotedUntil: Date | null = null;
    if (level !== 'NONE' && days) {
      promotedUntil = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        promotedLevel: level,
        promotedUntil: level === 'NONE' ? null : promotedUntil
      },
      include: {
        plan: true,
        users: { where: { role: 'TENANT' }, select: { id: true, name: true, email: true, phone: true } }
      }
    });

    const levelLabel = level === 'PROVINCE' ? 'İl Bazında' : level === 'DISTRICT' ? 'İlçe Bazında' : 'Kaldırıldı';
    res.json({
      success: true,
      message: `${tenant.name} salonu için öne çıkarma güncellendi: ${levelLabel}`,
      data: {
        ...updated,
        mediaCapacity: Number(updated.mediaCapacity),
        owner: updated.users[0] || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Plans Endpoints
router.get('/plans', async (req, res) => {
  try {
    const data = await prisma.subscriptionPlan.findMany();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/plans', async (req, res) => {
  try {
    const { name, price, storageLimitMB, features, isFree, isActive, maxAppointments, maxStaff } = req.body;
    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        price: Number(price),
        storageLimitMB: Number(storageLimitMB),
        features: features || {
          smsEnabled: false,
          whatsappEnabled: false,
          emailEnabled: true,
          customDomainAllowed: false,
          customPOSAllowed: false
        },
        isFree: Boolean(isFree),
        isActive: Boolean(isActive),
        maxAppointments: maxAppointments !== undefined && maxAppointments !== null ? Number(maxAppointments) : null,
        maxStaff: maxStaff !== undefined && maxStaff !== null ? Number(maxStaff) : null
      }
    });
    systemLogs.unshift({ message: `Yeni abonelik paketi oluşturuldu: ${name}`, timestamp: new Date().toISOString() });
    res.json({ success: true, data: newPlan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, storageLimitMB, features, isFree, isActive, maxAppointments, maxStaff } = req.body;
    const updated = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        price: price !== undefined ? Number(price) : undefined,
        storageLimitMB: storageLimitMB !== undefined ? Number(storageLimitMB) : undefined,
        features: features !== undefined ? features : undefined,
        isFree: isFree !== undefined ? Boolean(isFree) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        maxAppointments: maxAppointments !== undefined ? (maxAppointments === null ? null : Number(maxAppointments)) : undefined,
        maxStaff: maxStaff !== undefined ? (maxStaff === null ? null : Number(maxStaff)) : undefined
      }
    });
    systemLogs.unshift({ message: `Abonelik paketi güncellendi: ${updated.name}`, timestamp: new Date().toISOString() });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const activeTenants = await prisma.tenant.findMany();
    const isPlanUsed = activeTenants.some((t: any) => t.planId === id);
    if (isPlanUsed) {
      return res.status(400).json({ success: false, error: { message: 'Bu pakete bağlı salonlar olduğu için silinemez.' } });
    }
    const deleted = await prisma.subscriptionPlan.delete({
      where: { id }
    });
    systemLogs.unshift({ message: `Abonelik paketi silindi: ${deleted.name}`, timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});


router.post('/plans/migrate', (req, res) => {
  const { sourcePlanId, targetPlanId } = req.body;
  let count = 0;
  tenants.forEach(t => {
    if (t.planId === sourcePlanId) {
      t.planId = targetPlanId;
      count++;
    }
  });
  systemLogs.unshift({ message: `${count} salon paketi taşıma işlemi tamamlandı.`, timestamp: new Date().toISOString() });
  res.json({ success: true, message: `${count} salon başarıyla taşındı.` });
});

import { landingCmsStore } from '../services/landingCmsStore';

// Settings Endpoints
router.get('/r2-settings', (req, res) => {
  res.json({ success: true, data: r2Settings });
});

router.post('/r2-settings', (req, res) => {
  const { accountId, accessKey, secretKey, bucketName, publicCdnUrl } = req.body;
  r2Settings = { accountId, accessKey, secretKey, bucketName, publicCdnUrl };
  systemLogs.unshift({ message: `R2 ayarları güncellendi.`, timestamp: new Date().toISOString() });
  res.json({ success: true, data: r2Settings });
});

router.get('/settings', async (req, res) => {
  try {
    let globalSettings = await prisma.globalSettings.findFirst();
    if (!globalSettings) {
      // GlobalSettings yoksa varsayılan değerlerle oluştur
      globalSettings = await prisma.globalSettings.create({
        data: {
          cloudflareR2Config: {},
          smsConfig: { provider: 'netgsm', apiKey: '', title: 'KuaforArt' },
          posConfig: { provider: 'iyzico', apiKey: '', secretKey: '' },
          isDirectoryEnabled: false
        }
      });
    }
    res.json({
      success: true,
      data: {
        ...prismaSettings,
        isDirectoryEnabled: globalSettings.isDirectoryEnabled
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/settings', async (req, res) => {
  const { smsConfig, posConfig, isDirectoryEnabled } = req.body;
  if (smsConfig) prismaSettings.smsConfig = { ...prismaSettings.smsConfig, ...smsConfig };
  if (posConfig) prismaSettings.posConfig = { ...prismaSettings.posConfig, ...posConfig };

  try {
    // isDirectoryEnabled değerini GlobalSettings DB'ye kaydet
    if (isDirectoryEnabled !== undefined) {
      let globalSettings = await prisma.globalSettings.findFirst();
      if (globalSettings) {
        await prisma.globalSettings.update({
          where: { id: globalSettings.id },
          data: { isDirectoryEnabled: Boolean(isDirectoryEnabled) }
        });
      } else {
        await prisma.globalSettings.create({
          data: {
            cloudflareR2Config: {},
            smsConfig: prismaSettings.smsConfig,
            posConfig: prismaSettings.posConfig,
            isDirectoryEnabled: Boolean(isDirectoryEnabled)
          }
        });
      }
    }
    systemLogs.unshift({ message: `Global SMS/POS/Directory ayarları güncellendi.`, timestamp: new Date().toISOString() });
    res.json({
      success: true,
      data: {
        ...prismaSettings,
        isDirectoryEnabled: isDirectoryEnabled !== undefined ? Boolean(isDirectoryEnabled) : false
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ==========================================
// LANDING PAGE CMS ENDPOINTS
// ==========================================

// Helper to get or create config
async function getOrCreateLandingConfig() {
  let config = await prisma.landingPageConfig.findFirst();
  if (!config) {
    config = await prisma.landingPageConfig.create({
      data: {
        heroTitle: 'Apple Kalitesinde Salon Yönetimi',
        heroDescription: 'Randevulardan kasaya kadar tüm operasyonunuz için tek sistem.',
        ctaText: 'Ücretsiz Dene',
        ctaLink: '/register',
        isPublished: false,
        activeSections: { hero: true, timeline: true, chat: true, loyalty: true, finance: true, storefront: true, pricing: true }
      }
    });
  }
  return config;
}

// Get Draft Payload
router.get('/landing/draft', async (req, res) => {
  try {
    const data = await getOrCreateLandingConfig();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update Draft Payload
router.put('/landing/draft', async (req, res) => {
  try {
    const current = await getOrCreateLandingConfig();
    const updated = await prisma.landingPageConfig.update({
      where: { id: current.id },
      data: {
        ...req.body,
        isPublished: false // Any edit unpublishes it until explicit publish
      }
    });
    systemLogs.unshift({ message: 'Landing page taslağı güncellendi.', timestamp: new Date().toISOString() });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Publish Draft Payload to Live
router.post('/landing/publish', async (req, res) => {
  try {
    const current = await getOrCreateLandingConfig();
    const published = await prisma.landingPageConfig.update({
      where: { id: current.id },
      data: { isPublished: true }
    });
    const user = (req as any).user?.email || 'admin@kuafor.art';
    systemLogs.unshift({ message: `Landing page canlıya yayınlandı (Kullanıcı: ${user})`, timestamp: new Date().toISOString() });
    res.json({ success: true, data: published, message: 'Landing page başarıyla canlıya yayınlandı!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get Published Payload (for public site)
router.get('/landing/published', async (req, res) => {
  try {
    const data = await prisma.landingPageConfig.findFirst({
      where: { isPublished: true }
    });
    // If none published, fallback to draft or empty
    res.json({ success: true, data: data || await getOrCreateLandingConfig() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Media Library Endpoints
router.get('/media', (req, res) => {
  res.json({ success: true, data: landingCmsStore.getMediaAssets() });
});

router.post('/media/upload', (req, res) => {
  try {
    const { filename, url, fileSize, mimeType, altText } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: { message: 'URL veya dosya içeriği gereklidir.' } });
    }
    const newAsset = landingCmsStore.addMediaAsset({
      filename: filename || 'yuklenen-gorsel.png',
      url,
      fileSize: fileSize || 10240,
      mimeType: mimeType || 'image/png',
      altText: altText || 'Medya Görseli'
    });
    systemLogs.unshift({ message: `Medya kütüphanesine görsel eklendi: ${newAsset.filename}`, timestamp: new Date().toISOString() });
    res.json({ success: true, data: newAsset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/media/:id', (req, res) => {
  const { id } = req.params;
  const deleted = landingCmsStore.deleteMediaAsset(id);
  if (deleted) {
    systemLogs.unshift({ message: `Medya silindi: ${id}`, timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Medya başarıyla silindi.' });
  } else {
    res.status(404).json({ success: false, error: { message: 'Medya bulunamadı.' } });
  }
});

// Audit Logs
router.get('/audit-logs', (req, res) => {
  res.json({ success: true, data: landingCmsStore.getAuditLogs() });
});

export default router;

