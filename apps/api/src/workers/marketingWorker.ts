import { prisma } from '@kuafor-art/database';

console.log("[MarketingWorker] Marketing worker started. Running every 24 hours...");

export async function runMarketingBots() {
  console.log('[MarketingWorker] Running daily marketing campaigns...');
  try {
    const today = new Date();
    
    // Aktif ve botları açık olan tenantları bul
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: { settings: true }
    });

    for (const tenant of tenants) {
      if (!tenant.settings) continue;
      
      const { enableReengagementBot, reengagementDays, enableBirthdayBot } = tenant.settings;

      // 1. REENGAGEMENT (Geri Çağırma) BOTU
      if (enableReengagementBot && reengagementDays > 0) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - reengagementDays);

        // Son randevusu thresholdDate'den önce olan ve daha önce hatırlatılmamış (veya üstünden 1 ay geçmiş) müşteriler
        const dormantCustomers = await prisma.customer.findMany({
          where: {
            tenantId: tenant.id,
            lastAppointmentAt: { lt: thresholdDate },
            OR: [
              { lastMarketingSentAt: null },
              { lastMarketingSentAt: { lt: thresholdDate } }
            ]
          }
        });

        for (const customer of dormantCustomers) {
          console.log(`[MarketingWorker] Reengagement SMS to be sent to ${customer.name} (Tenant: ${tenant.name})`);
          
          // Müşteri pazarlama logunu oluştur
          await prisma.marketingLog.create({
            data: {
              tenantId: tenant.id,
              channel: 'WHATSAPP',
              type: 'REENGAGEMENT',
              recipient: customer.phone,
              status: 'SENT'
            }
          });

          // lastMarketingSentAt güncelle
          await prisma.customer.update({
            where: { id: customer.id },
            data: { lastMarketingSentAt: new Date() }
          });
        }
      }

      // 2. DOĞUM GÜNÜ BOTU
      if (enableBirthdayBot) {
        // Bugün doğum günü olan müşteriler (Ay ve gün eşleşen)
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        // Prisma date filtering for just day and month is tricky in some DBs, 
        // we'll fetch those who have birthDate and filter in memory for now (or write raw query)
        const allCustomersWithBday = await prisma.customer.findMany({
          where: {
            tenantId: tenant.id,
            birthDate: { not: null }
          }
        });

        const bdayCustomers = allCustomersWithBday.filter((c: any) => {
          if (!c.birthDate) return false;
          const bDate = new Date(c.birthDate);
          return bDate.getMonth() + 1 === currentMonth && bDate.getDate() === currentDay;
        });

        for (const customer of bdayCustomers) {
          console.log(`[MarketingWorker] Happy Birthday SMS to be sent to ${customer.name} (Tenant: ${tenant.name})`);
          
          await prisma.marketingLog.create({
            data: {
              tenantId: tenant.id,
              channel: 'WHATSAPP',
              type: 'BIRTHDAY',
              recipient: customer.phone,
              status: 'SENT'
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('[MarketingWorker] Error:', error);
  }
}

// Günde bir kez (örneğin sabah 09:00'da) çalıştırılacak şekilde ayarlanabilir.
// setInterval(runMarketingBots, 24 * 60 * 60 * 1000);
