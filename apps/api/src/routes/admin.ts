import { Router } from 'express';
import { prisma } from '@kuafor-art/database';
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
router.get('/tenants', (req, res) => {
  const tenantsWithPlans = tenants.map(t => ({
    ...t,
    plan: plans.find(p => p.id === t.planId)
  }));
  res.json({ success: true, data: tenantsWithPlans });
});

router.post('/tenants', (req, res) => {
  const { name, slug, subdomain, customDomain, planId } = req.body;
  const newTenant = {
    id: `tenant-${Math.random().toString(36).substr(2, 9)}`,
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    subdomain: subdomain || null,
    customDomain: customDomain || null,
    planId: planId || plans[0].id,
    mediaCapacity: 1024 * 1024 * 100, // 100MB default
    isActive: true,
    billingStatus: 'ACTIVE',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  tenants.push(newTenant);
  systemLogs.unshift({ message: `Yeni salon eklendi: ${name}`, timestamp: new Date().toISOString() });
  
  res.json({
    success: true,
    data: {
      ...newTenant,
      plan: plans.find(p => p.id === newTenant.planId)
    }
  });
});

router.put('/tenants/:id', (req, res) => {
  const { id } = req.params;
  const { isActive, mediaCapacity, planId, customDomain, billingStatus } = req.body;
  const index = tenants.findIndex(t => t.id === id);
  if (index !== -1) {
    tenants[index] = {
      ...tenants[index],
      isActive: isActive !== undefined ? isActive : tenants[index].isActive,
      mediaCapacity: mediaCapacity !== undefined ? mediaCapacity : tenants[index].mediaCapacity,
      planId: planId !== undefined ? planId : tenants[index].planId,
      customDomain: customDomain !== undefined ? customDomain : tenants[index].customDomain,
      billingStatus: billingStatus !== undefined ? billingStatus : tenants[index].billingStatus
    };
    systemLogs.unshift({ message: `Salon güncellendi: ${tenants[index].name}`, timestamp: new Date().toISOString() });
    res.json({
      success: true,
      data: {
        ...tenants[index],
        plan: plans.find(p => p.id === tenants[index].planId)
      }
    });
  } else {
    res.status(404).json({ success: false, error: { message: 'Tenant not found' } });
  }
});

router.post('/tenants/:id/gift', (req, res) => {
  const { id } = req.params;
  const { durationType, amount, note } = req.body;
  const index = tenants.findIndex(t => t.id === id);
  if (index !== -1) {
    const nextDate = new Date(tenants[index].nextBillingDate || Date.now());
    if (durationType === 'MONTH') {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else {
      nextDate.setDate(nextDate.getDate() + amount);
    }
    tenants[index].nextBillingDate = nextDate.toISOString();
    systemLogs.unshift({ message: `Salon (${tenants[index].name}) için ${amount} ${durationType === 'MONTH' ? 'ay' : 'gün'} hediye süre eklendi.`, timestamp: new Date().toISOString() });
    res.json({
      success: true,
      data: {
        ...tenants[index],
        plan: plans.find(p => p.id === tenants[index].planId)
      }
    });
  } else {
    res.status(404).json({ success: false, error: { message: 'Tenant not found' } });
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

router.get('/settings', (req, res) => {
  res.json({ success: true, data: prismaSettings });
});

router.post('/settings', (req, res) => {
  const { smsConfig, posConfig } = req.body;
  if (smsConfig) prismaSettings.smsConfig = { ...prismaSettings.smsConfig, ...smsConfig };
  if (posConfig) prismaSettings.posConfig = { ...prismaSettings.posConfig, ...posConfig };
  systemLogs.unshift({ message: `Global SMS/POS ayarları güncellendi.`, timestamp: new Date().toISOString() });
  res.json({ success: true, data: prismaSettings });
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

