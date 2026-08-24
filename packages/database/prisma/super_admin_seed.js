const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  // 1. Create or Update Subscription Plans
  const plans = [
    {
      name: "FREE",
      price: 0.0,
      storageLimitMB: 100,
      features: {
        smsEnabled: false,
        whatsappEnabled: false,
        emailEnabled: true,
        customDomainAllowed: false,
        customPOSAllowed: false
      },
      isFree: true
    },
    {
      name: "PRO",
      price: 799.0,
      storageLimitMB: 500,
      features: {
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: true,
        customDomainAllowed: false,
        customPOSAllowed: false
      },
      isFree: false
    },
    {
      name: "ELITE",
      price: 1499.0,
      storageLimitMB: 10240, // 10GB
      features: {
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: true,
        customDomainAllowed: true,
        customPOSAllowed: true
      },
      isFree: false
    }
  ];

  const dbPlans = {};
  for (const plan of plans) {
    let dbPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name }
    });

    if (!dbPlan) {
      dbPlan = await prisma.subscriptionPlan.create({
        data: plan
      });
      console.log(`Created plan: ${plan.name}`);
    } else {
      dbPlan = await prisma.subscriptionPlan.update({
        where: { id: dbPlan.id },
        data: plan
      });
      console.log(`Updated plan: ${plan.name}`);
    }
    dbPlans[plan.name] = dbPlan;
  }

  // 2. Create GlobalSettings if not exists
  const globalSettings = await prisma.globalSettings.findFirst();
  if (!globalSettings) {
    await prisma.globalSettings.create({
      data: {
        cloudflareR2Config: {
          accountId: "mock-account-id",
          accessKeyId: "mock-access-key-id",
          secretAccessKey: "mock-secret-access-key",
          bucketName: "mock-bucket"
        },
        smsConfig: {
          provider: "netgsm",
          apiKey: "mock-api-key",
          title: "kuaforart"
        },
        posConfig: {
          provider: "iyzico",
          apiKey: "mock-pos-key",
          secretKey: "mock-pos-secret"
        }
      }
    });
    console.log("Created mock GlobalSettings");
  }

  // 3. Connect existing tenants to the correct plans
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    if (!tenant.planId) {
      // By default map to FREE plan, unless slug is 'prestij' then map to ELITE
      const targetPlanName = tenant.slug === 'prestij' ? 'ELITE' : 'FREE';
      const targetPlan = dbPlans[targetPlanName];
      
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          planId: targetPlan.id,
          billingStatus: "ACTIVE",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
      console.log(`Associated tenant '${tenant.name}' with plan '${targetPlanName}'`);
    }
  }

  console.log("Super admin seed completed successfully!");
}

main()
  .catch(e => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
