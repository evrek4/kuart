import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // 1. Abonelik Paketleri Oluşturma
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1' },
    update: {
      allowPortalThemes: false,
      features: JSON.stringify(['basic_booking', '1_staff'])
    },
    create: {
      id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
      name: 'FREE',
      price: 0.0,
      storageLimitMB: 100,
      features: JSON.stringify(['basic_booking', '1_staff']),
      isFree: true,
      isActive: true,
      allowPortalThemes: false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3' },
    update: {
      allowPortalThemes: false,
      features: JSON.stringify(['basic_booking', 'unlimited_staff', 'payment_gateway'])
    },
    create: {
      id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      name: 'PRO',
      price: 499.0,
      storageLimitMB: 500,
      features: JSON.stringify(['basic_booking', 'unlimited_staff', 'payment_gateway']),
      isFree: false,
      isActive: true,
      allowPortalThemes: false,
    },
  });

  const elitePlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2' },
    update: {
      allowPortalThemes: true,
      features: JSON.stringify(['custom_domain', 'unlimited_staff', 'payment_gateway'])
    },
    create: {
      id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
      name: 'ELITE',
      price: 999.0,
      storageLimitMB: 1024,
      features: JSON.stringify(['custom_domain', 'unlimited_staff', 'payment_gateway']),
      isFree: false,
      isActive: true,
      allowPortalThemes: true,
    },
  });

  // Şifre: password123 (Garanti bcrypt hash)
  const passwordHash = '$2b$10$2gy5udFIspC8YgUHultSeuQDGkN1PYKGMEbVF27V4SCJ2JXY1gOKK';

  // 2. Super Admin Kullanıcısı Oluşturma
  const adminEmail = 'admin@kuafor.art';
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: passwordHash
    },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      passwordHash: passwordHash,
      isActive: true,
    },
  });
  console.log(`[Seed] Created/Updated Super Admin: ${superAdmin.email}`);

  // 3. Test Kiracısı (Tenant) Oluşturma
  const tenantSlug = 'melek';
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {
      isActive: true,
      planId: elitePlan.id,
    },
    create: {
      name: 'Melek Kuaför',
      slug: tenantSlug,
      subdomain: tenantSlug,
      customDomain: 'melekkuafor.com',
      planId: elitePlan.id,
      mediaCapacity: 1073741824, // 1 GB
      isActive: true,
    },
  });
  console.log(`[Seed] Created/Updated Tenant: ${tenant.name} (${tenant.slug})`);

  // 4. Kiracı Ayarlarını (TenantSettings) Oluşturma
  await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      customPaymentGateway: true,
      posProviderName: 'iyzico',
      gatewayApiKey: 'iyzi-api-melek-key-12345',
      gatewaySecretKey: 'iyzi-secret-melek-key-67890',
      themeTemplate: 'template-luxury',
      heroTitle: 'MELEK GÜZELLİK & SAÇ TASARIM',
      heroSubtitle: 'Nişantaşı\'nda Premium Saç Tasarımı ve Kişiye Özel Stil Deneyimi',
      aboutText: '10 yılı aşkın süredir Nişantaşı\'nda en yüksek kalitede saç kesimi, renklendirme ve stil hizmetleri sunarak güzelliğinizi ön plana çıkartıyoruz. Uzman ekibimizle sadece saçınızı değil, tarzınızı da tasarlıyoruz.',
      instagramUrl: 'https://instagram.com/melek_kuafor',
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop'
    },
    create: {
      tenantId: tenant.id,
      emailEnabled: true,
      smsEnabled: true,
      whatsappEnabled: true,
      noShowLimit: 2,
      requiredDepositAmount: 150.0,
      customPaymentGateway: true,
      posProviderName: 'iyzico',
      gatewayApiKey: 'iyzi-api-melek-key-12345',
      gatewaySecretKey: 'iyzi-secret-melek-key-67890',
      themeTemplate: 'template-luxury',
      heroTitle: 'MELEK GÜZELLİK & SAÇ TASARIM',
      heroSubtitle: 'Nişantaşı\'nda Premium Saç Tasarımı ve Kişiye Özel Stil Deneyimi',
      aboutText: '10 yılı aşkın süredir Nişantaşı\'nda en yüksek kalitede saç kesimi, renklendirme ve stil hizmetleri sunarak güzelliğinizi ön plana çıkartıyoruz. Uzman ekibimizle sadece saçınızı değil, tarzınızı da tasarlıyoruz.',
      instagramUrl: 'https://instagram.com/melek_kuafor',
      coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
      globalPaymentPolicy: 'DEPOSIT'
    },
  });
  console.log(`[Seed] Created Tenant Settings for ${tenant.name}`);

  // 5. Çalışanları (Staff - Users) Oluşturma
  const staff1 = await prisma.user.upsert({
    where: { email: 'ahmet@melekkuafor.com' },
    update: {
      passwordHash: passwordHash
    },
    create: {
      tenantId: tenant.id,
      email: 'ahmet@melekkuafor.com',
      passwordHash: passwordHash,
      name: 'Ahmet Yılmaz',
      role: 'SALON_STAFF',
      phone: '0532 999 8811',
      isActive: true,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'ayse@melekkuafor.com' },
    update: {
      passwordHash: passwordHash
    },
    create: {
      tenantId: tenant.id,
      email: 'ayse@melekkuafor.com',
      passwordHash: passwordHash,
      name: 'Ayşe Demir',
      role: 'SALON_STAFF',
      phone: '0532 999 8822',
      isActive: true,
    },
  });
  console.log(`[Seed] Created/Updated Salon Staff: ${staff1.name}, ${staff2.name}`);

  // 5.5. Personel (Staff) Kayıtlarını Oluşturma (Melek Kuaför için)
  await prisma.staff.upsert({
    where: { id: 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1' },
    update: {
      name: 'Ahmet Yılmaz',
      title: 'Usta Kuaför',
      phone: '0532 999 8811',
      isActive: true
    },
    create: {
      id: 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1',
      tenantId: tenant.id,
      name: 'Ahmet Yılmaz',
      title: 'Usta Kuaför',
      phone: '0532 999 8811',
      isActive: true
    }
  });

  await prisma.staff.upsert({
    where: { id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2' },
    update: {
      name: 'Ayşe Demir',
      title: 'Renk Uzmanı',
      phone: '0532 999 8822',
      isActive: true
    },
    create: {
      id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
      tenantId: tenant.id,
      name: 'Ayşe Demir',
      title: 'Renk Uzmanı',
      phone: '0532 999 8822',
      isActive: true
    }
  });
  console.log(`[Seed] Created/Updated Staff (Personnel) records for Melek Kuaför.`);

  // 5.8. Mevcut tüm kiracılar için eksik Staff kayıtlarını tamamla (Self-healing)
  const allTenants = await prisma.tenant.findMany({
    include: {
      users: { where: { role: 'SALON_OWNER' } },
      staff: true
    }
  });

  for (const t of allTenants) {
    if (t.staff.length === 0 && t.users.length > 0) {
      const owner = t.users[0];
      await prisma.staff.create({
        data: {
          tenantId: t.id,
          name: owner.name,
          title: 'Salon Sahibi',
          phone: owner.phone,
          isActive: true
        }
      });
      console.log(`[Seed] Created default Staff record for tenant: ${t.name} (Owner: ${owner.name})`);
    }
  }

  // 6. Hizmetleri (Services) Oluşturma
  const services = [
    { name: 'Saç Kesimi & Stil', description: 'Kişiye özel modern saç kesimi ve şekillendirme.', price: 180.0, duration: 30 },
    { name: 'Fön', description: 'Kusursuz düz veya dalgalı fön işlemi.', price: 60.0, duration: 20 },
    { name: 'Boya & Renklendirme', description: 'Premium boya markalarıyla saç renklendirme.', price: 750.0, duration: 120 },
  ];

  await prisma.service.deleteMany({
    where: { tenantId: tenant.id }
  });

  for (const s of services) {
    await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        isActive: true,
      },
    });
  }
  console.log(`[Seed] Created Services: Saç Kesimi, Fön, Boya`);

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed Error] Seeding process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
