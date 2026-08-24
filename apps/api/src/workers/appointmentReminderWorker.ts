import { prisma } from '@kuafor-art/database';

console.log("[ReminderWorker] Appointment reminder and review worker started. Running every 15 minutes...");

export async function runAppointmentReminders() {
  console.log('[ReminderWorker] Checking for upcoming appointments and pending reviews...');
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 saat sonrası
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 gün öncesi

    // 1. HATIRLATICI (YAKLAŞAN RANDEVULAR)
    // 2 saat içinde başlayacak olan ve henüz hatırlatılmamış ONAYLI randevular
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        dateTime: {
          gt: now,
          lte: twoHoursFromNow
        },
        reminderSentAt: null
      },
      include: {
        customer: true,
        tenant: true
      }
    });

    for (const appt of upcomingAppointments) {
      if (!appt.customer.phone) continue;
      
      console.log(`[ReminderWorker] Reminder SMS to be sent to ${appt.customer.name} (Tenant: ${appt.tenant.name})`);
      
      await prisma.marketingLog.create({
        data: {
          tenantId: appt.tenantId,
          channel: 'WHATSAPP',
          type: 'REMINDER',
          recipient: appt.customer.phone,
          status: 'SENT'
        }
      });

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSentAt: new Date() }
      });
    }

    // 2. OTOMATİK GOOGLE YORUM İSTEĞİ (TAMAMLANAN RANDEVULAR)
    // Son 24 saat içinde tamamlanmış ve henüz yorum istenmemiş randevular
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        status: 'COMPLETED',
        dateTime: {
          gte: yesterday,
          lt: now
        },
        reviewSentAt: null
      },
      include: {
        customer: true,
        tenant: { include: { settings: true } }
      }
    });

    for (const appt of completedAppointments) {
      if (!appt.customer.phone) continue;
      
      // Google Review linki tanımlı mı?
      const reviewUrl = appt.tenant.settings?.googleReviewUrl;
      if (!reviewUrl) continue;

      console.log(`[ReminderWorker] Google Review request to be sent to ${appt.customer.name} (Tenant: ${appt.tenant.name})`);
      
      await prisma.reviewRequest.create({
        data: {
          tenantId: appt.tenantId,
          appointmentId: appt.id,
          status: 'SENT',
          sentAt: new Date()
        }
      });

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reviewSentAt: new Date() }
      });
    }

  } catch (error) {
    console.error('[ReminderWorker] Error:', error);
  }
}

// 15 dakikada bir çalıştırılacak şekilde ayarlanabilir.
// setInterval(runAppointmentReminders, 15 * 60 * 1000);
