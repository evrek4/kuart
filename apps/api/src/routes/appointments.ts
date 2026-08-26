import { Router, Response } from 'express';
import { prisma, getTenantPrisma } from '@kuafor-art/database';
import { redisConnection } from '../queues/connection';
import { sendSms } from '../services/sms';
import { requireTenant, TenantRequest } from '../middlewares/tenant';
import { requireAuth, requireTenantAdmin, AuthRequest } from '../middlewares/auth';
import { addNotificationJob } from '../queues/notificationQueue';
import { ApiResponse } from '@kuafor-art/shared-types';
import { PosFactory } from '../services/payment/posFactory';
import { sendEmail } from '../services/email';
import { sendWhatsAppTextMessage } from '../services/whatsapp';

import { withAppointmentLock } from '../lib/appointmentLock';

const router = Router();

// ==========================================
// 1. OTP GÖNDERİMİ (POST /api/appointments/send-otp)
// ==========================================
router.post('/send-otp', requireTenant, async (req: TenantRequest, res: Response) => {
  const { phone, email } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Telefon numarası zorunludur.' }
    } as ApiResponse);
  }

  try {
    
    const tenantId = req.tenant!.id;

    // --- RATE LIMITING START ---
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const rlKeyIp = `rl:otp:${tenantId}:ip:${clientIp}`;
    const rlKeyPhone = `rl:otp:${tenantId}:phone:${phone}`;
    
    const [ipCount, phoneCount] = await Promise.all([
      redisConnection.incr(rlKeyIp),
      redisConnection.incr(rlKeyPhone)
    ]);
    
    if (ipCount === 1) await redisConnection.expire(rlKeyIp, 180);
    if (phoneCount === 1) await redisConnection.expire(rlKeyPhone, 180);
    
    if (ipCount > 3 || phoneCount > 3) {
      return res.status(429).json({
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Çok fazla istek attınız, lütfen bekleyin.' }
      } as any);
    }
    // --- RATE LIMITING END ---


    // 6 Haneli geçici doğrulama kodu üretimi
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Redis üzerinde 3 dakika (180 saniye) süreli kayıt
    const redisKey = `otp:${tenantId}:${phone}`;
    await redisConnection.set(redisKey, otpCode, 'EX', 180);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, plan: { select: { name: true } } }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'TENANT_NOT_FOUND', message: 'Salon bulunamadı.' }
      } as ApiResponse);
    }

    console.log(`[OTP Engine] Generated ${otpCode} for ${phone}. Tenant: ${tenant.name} (${tenant.plan?.name})`);

    // 1. WhatsApp ile Doğrulama Kodu Gönderimi (Öncelikli)
    const waMessage = `*${tenant.name}* randevu doğrulama kodunuz: *${otpCode}*\n\nBu kod 3 dakika boyunca geçerlidir. Lütfen kimseyle paylaşmayınız.`;
    const waSent = await sendWhatsAppTextMessage(phone, waMessage);
    
    if (waSent) {
      console.log(`[OTP Engine] OTP sent successfully via WhatsApp to ${phone}`);
    } else {
      console.log(`[OTP Engine] WhatsApp gönderimi yapılamadı, SMS / E-Posta deneniyor...`);
      // WhatsApp gönderilemezse veya bağlı değilse SMS & Email fallback
      if (email) {
        const emailSubject = `${tenant.name} Randevu Doğrulama Kodu`;
        const emailHtml = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d97706;">Randevu Doğrulama Kodu</h2>
            <p>Merhaba,</p>
            <p><b>${tenant.name}</b> salonundan randevu oluşturmak için doğrulama kodunuz aşağıdadır:</p>
            <div style="background-color: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px; margin: 20px 0; color: #111;">
              ${otpCode}
            </div>
            <p>Bu kod 3 dakika süreyle geçerlidir.</p>
          </div>
        `;
        await sendEmail(email, emailSubject, emailHtml).catch(() => {});
      }
      
      const smsMessage = `Kuafor.art: ${tenant.name} randevu dogrulama kodunuz: ${otpCode}`;
      await sendSms(phone, smsMessage).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      data: { message: 'Doğrulama kodu başarıyla iletildi.' }
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[OTP Send Error]:', errMessage);
    return res.status(500).json({
      success: false,
      error: { code: 'OTP_SEND_FAILED', message: 'Doğrulama kodu iletilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin.' }
    } as ApiResponse);
  }
});

// ==========================================
// 2. OTP DOĞRULAMA (POST /api/appointments/verify-otp)
// ==========================================
router.post('/verify-otp', requireTenant, async (req: TenantRequest, res: Response) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Telefon numarası ve doğrulama kodu zorunludur.' }
    } as ApiResponse);
  }

  try {
    const tenantId = req.tenant!.id;
    const redisKey = `otp:${tenantId}:${phone}`;

    // Kodu Redis'ten çek
    const storedCode = await redisConnection.get(redisKey);

    if (!storedCode) {
      return res.status(400).json({
        success: false,
        error: { code: 'OTP_EXPIRED', message: 'Doğrulama kodunun süresi dolmuş (3 dakika) veya kod hiç gönderilmemiş.' }
      } as ApiResponse);
    }

    if (storedCode !== code) {
      return res.status(400).json({
        success: false,
        error: { code: 'OTP_INVALID', message: 'Girdiğiniz doğrulama kodu hatalıdır.' }
      } as ApiResponse);
    }

    // Kod doğru ise tek seferlik olduğu için silinir
    await redisConnection.del(redisKey);

    return res.status(200).json({
      success: true,
      data: { verified: true, message: 'Doğrulama başarılı.' }
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[OTP Verify Error]:', errMessage);
    return res.status(500).json({
      success: false,
      error: { code: 'OTP_VERIFICATION_FAILED', message: 'Doğrulama işlemi gerçekleştirilemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 1.5. RANDEVULARI LİSTELE (GET /api/appointments)
// ==========================================
router.get('/', requireTenant, async (req: TenantRequest, res: Response) => {
  const { date, staffId } = req.query;

  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const whereClause: any = {};

    if (date && typeof date === 'string') {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      whereClause.dateTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (staffId && typeof staffId === 'string') {
      whereClause.staffId = staffId;
    }

    const appointments = await tenantPrisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true }
        },
        service: {
          select: { id: true, name: true, price: true, duration: true }
        },
        staff: {
          select: { id: true, name: true, title: true }
        }
      },
      orderBy: {
        dateTime: 'asc'
      }
    });

    const formatted = appointments.map((app: any) => ({
      id: app.id,
      dateTime: app.dateTime.toISOString(),
      scheduledAt: app.dateTime.toISOString(),
      time: `${app.dateTime.getUTCHours().toString().padStart(2, '0')}:${app.dateTime.getUTCMinutes().toString().padStart(2, '0')}`,
      date: app.dateTime.toISOString().split('T')[0],
      clientName: app.customer.name,
      phone: app.customer.phone,
      service: app.service.name,
      serviceId: app.service.id,
      serviceName: app.service.name,
      staffId: app.staffId || '',
      staffName: app.staff?.name || 'Genel Personel',
      staffTitle: app.staff?.title || '',
      status: app.status,
      confirmationStatus: app.confirmationStatus,
      isPaid: app.isPaid,
      paymentMethod: app.paymentMethod,
      paidAmount: app.paidAmount,
      staffCommissionEarned: app.staffCommissionEarned,
      price: app.service.price ? Number(app.service.price) : 0,
      duration: app.service.duration || 30,
      notes: app.notes || ''
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    } as ApiResponse);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[GetAppointments] Error:', errMessage);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Randevular çekilemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 2.5. BOŞ SAAT HESAPLAMA (GET /api/appointments/available-slots)
// ==========================================
router.get('/available-slots', requireTenant, async (req: TenantRequest, res: Response) => {
  const { staffId, date, duration } = req.query;

  if (!staffId || !date || !duration) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'staffId, date ve duration parametreleri zorunludur.' }
    } as ApiResponse);
  }

  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    
    const settings = await tenantPrisma.tenantSettings.findFirst();
    const serviceDuration = parseInt(duration as string);
    const requiredSlots = Math.ceil(serviceDuration / 30);

    // Günün haftanın hangi günü olduğunu tespit et (0: Pazar, 1: Pazartesi, ...)
    const targetDate = new Date(`${date}T12:00:00.000Z`);
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[targetDate.getUTCDay()];

    const workingHours = (settings as any)?.workingHours;
    let dayConfig = workingHours?.[dayKey];
    if (!dayConfig) {
      // Varsayılan çalışma saatleri: Pazartesi-Cumartesi 09:00-20:00, Pazar kapalı
      dayConfig = {
        isOpen: dayKey !== 'sunday',
        start: '09:00',
        end: '20:00'
      };
    }

    // Eğer salon seçili günde kapalıysa boş slot döndür
    if (!dayConfig.isOpen) {
      return res.status(200).json({
        success: true,
        data: []
      } as ApiResponse);
    }

    const masterSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
    ];

    const allSlots = masterSlots.filter(s => s >= dayConfig.start && s <= dayConfig.end);

    // O gün seçilen personel için iptal edilmemiş tüm randevuları çek
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const appointments = await tenantPrisma.appointment.findMany({
      where: {
        staffId: staffId as string,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        service: true
      }
    });

    // Engellenen slotları belirle
    const blockedSlots = new Set<string>();

    for (const app of appointments) {
      const appHour = app.dateTime.getUTCHours().toString().padStart(2, '0');
      const appMin = app.dateTime.getUTCMinutes().toString().padStart(2, '0');
      const appTime = `${appHour}:${appMin}`;

      const startIndex = allSlots.indexOf(appTime);
      if (startIndex !== -1) {
        const slotsCount = Math.ceil((app.service.duration || 30) / 30);
        for (let i = 0; i < slotsCount; i++) {
          const blockedTime = allSlots[startIndex + i];
          if (blockedTime) {
            blockedSlots.add(blockedTime);
          }
        }
      }
    }

    // Boş saat dilimlerini hesapla
    const availableSlots: string[] = [];

    for (let i = 0; i < allSlots.length; i++) {
      let isAvailable = true;
      
      for (let j = 0; j < requiredSlots; j++) {
        const checkSlot = allSlots[i + j];
        if (!checkSlot || blockedSlots.has(checkSlot)) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        availableSlots.push(allSlots[i]);
      }
    }

    return res.status(200).json({
      success: true,
      data: availableSlots
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[AvailableSlots] Error:', errMessage);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Boş saat dilimleri hesaplanamadı.' }
    } as ApiResponse);
  }
});

// ==========================================
// 3. YENİ RANDEVU OLUŞTUR (POST /api/appointments)
// ==========================================
router.post('/', requireTenant, async (req: TenantRequest, res: Response) => {
  const { serviceId, serviceIds, staffId, dateTime, customerName, customerPhone, customerEmail, notes } = req.body;

  const targetServiceIds: string[] = serviceIds || (serviceId ? [serviceId] : []);
  const cleanPhone = customerPhone ? String(customerPhone).replace(/\s+/g, '').trim() : '';

  if (targetServiceIds.length === 0 || !staffId || !dateTime || !customerName || !cleanPhone) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Eksik randevu bilgileri. Hizmet(ler), personel, tarih, müşteri adı ve telefon numarası zorunludur.' }
    } as ApiResponse);
  }

  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const settings = await tenantPrisma.tenantSettings.findFirst();
    const defaultDeposit = settings?.defaultDepositAmount ? Number(settings.defaultDepositAmount) : 150.00;
    const globalPolicy = settings?.globalPaymentPolicy || 'DEPOSIT';

    // ── PLAN KOTASI: Aylık randevu limiti kontrolü ──────────────────────────────
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    const maxAppointments = (tenant?.plan as any)?.maxAppointments ?? null;
    if (maxAppointments !== null) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthlyCount = await tenantPrisma.appointment.count({
        where: {
          tenantId,
          dateTime: { gte: startOfMonth, lt: startOfNextMonth },
          status: { notIn: ['CANCELLED'] },
        },
      });
      if (monthlyCount >= maxAppointments) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'APPOINTMENT_LIMIT_REACHED',
            message: 'Aylık randevu limitinize ulaştınız. Paketinizi yükseltin.',
          },
        } as ApiResponse);
      }
    }
    // ────────────────────────────────────────────────────────────────────────────

    // Müşteriyi bul veya oluştur (findFirst + create/update)
    let customer = await tenantPrisma.customer.findFirst({
      where: {
        tenantId,
        phone: cleanPhone,
      },
    });

    if (customer) {
      customer = await tenantPrisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          ...(customerEmail && { email: customerEmail }),
        },
      });
    } else {
      customer = await tenantPrisma.customer.create({
        data: {
          tenantId,
          name: customerName,
          phone: cleanPhone,
          email: customerEmail || null,
          requiresDeposit: globalPolicy !== 'NONE',
        },
      });
    }

    let currentDateTime = new Date(dateTime);
    const createdAppointments: Array<{ id: string; status: string; dateTime: Date; service: { name: string; price: number | null; duration: number } }> = [];

    for (const sId of targetServiceIds) {
      const service = await tenantPrisma.service.findUnique({
        where: { id: sId }
      });
      
      if (!service) {
        return res.status(404).json({
          success: false,
          error: { code: 'SERVICE_NOT_FOUND', message: `Hizmet bulunamadı: ID = ${sId}` }
        } as ApiResponse);
      }

      // ── ÇAKIŞMA (OVERLAP) KONTROLÜ ────────────────────────────────────────────
      // Bu hizmetin bitiş zamanını hesapla
      const serviceEndTime = new Date(currentDateTime.getTime() + (service.duration || 30) * 60 * 1000);
      // Aynı personel için zaman aralığında çakışan aktif randevu var mı?
      const overlapping = await tenantPrisma.appointment.findFirst({
        where: {
          tenantId,
          staffId,
          status: { notIn: ['CANCELLED'] },
          dateTime: {
            gte: currentDateTime,
            lt: serviceEndTime,
          },
        },
      });
      if (overlapping) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'TIME_CONFLICT',
            message: `Seçilen ${staffId} personeli için ${currentDateTime.toISOString()} saatinde çakışan bir randevu bulunmaktadır.`,
          },
        } as ApiResponse);
      }
      // ────────────────────────────────────────────────────────────────────────────

      let status: any = 'CONFIRMED';
      const appointment: any = await tenantPrisma.appointment.create({
        data: {
          tenantId,
          customerId: customer.id,
          serviceId: sId,
          staffId,
          dateTime: currentDateTime,
          status,
          notes: notes || null
        },
        include: {
          service: true,
          staff: true
        }
      });

      createdAppointments.push({
        id: appointment.id,
        status: appointment.status,
        dateTime: appointment.dateTime,
        service: {
          name: appointment.service.name,
          price: appointment.service.price ? Number(appointment.service.price) : null,
          duration: appointment.service.duration
        }
      });

      // Sıradaki hizmetin başlangıç zamanını, bu hizmetin süresi kadar ileri kaydır
      currentDateTime = new Date(currentDateTime.getTime() + (service.duration || 30) * 60 * 1000);
    }

    // POS kapora veya fiyat kontrolü ve ödeme kaydı oluşturma
    for (const app of createdAppointments) {
      const requiresDeposit = customer.requiresDeposit;

      // Ödeme zorunluluğu yoksa veya kapora muafiyeti varsa POS'u atla
      if (!requiresDeposit) {
        console.log(`[POS Bypass] Bypassing payment for appointment ${app.id} (Customer requiresDeposit: ${requiresDeposit}, Global policy: ${globalPolicy})`);
        continue;
      }

      // Kapora veya Tam Ücret Tutarı
      let posAmount = defaultDeposit;
      let paymentType: 'DEPOSIT' | 'FULL_PAYMENT' = 'DEPOSIT';

      if (globalPolicy === 'FULL_PRICE') {
        posAmount = app.service.price || 0;
        paymentType = 'FULL_PAYMENT';
      }

      // GÜVENLIK: Hardcoded mock kart verisi kaldırıldı.
      // POS entegrasyonu için gerçek kart verisi frontend'den alınmalıdır.
      // Bu blok yalnızca geliştirme ortamında simülasyon amaçlı çalışabilir.
      if (process.env.NODE_ENV !== 'production') {
        // Geliştirme ortamı: POS simülasyonu (gerçek kart verisi yok)
        console.log(`[POS Simulation] DEV-ONLY: Simulating payment of ${posAmount} TL for appointment ${app.id}. No real card charged.`);
        await tenantPrisma.payment.create({
          data: {
            tenantId: req.tenant!.id,
            appointmentId: app.id,
            amount: posAmount,
            status: 'SUCCESSFUL',
            type: paymentType,
            provider: 'iyzico_simulation',
            transactionId: `sim_${Date.now()}_${app.id}`
          }
        });
        await tenantPrisma.appointment.update({
          where: { id: app.id },
          data: { status: 'CONFIRMED' }
        });
        app.status = 'CONFIRMED';
      } else {
        // Üretim ortamı: Gerçek POS entegrasyonu burada yapılmalı.
        // Frontend'den gelen kart token / 3DS callback ile tetiklenmelidir.
        console.warn(`[POS Integration] Production POS skipped for appointment ${app.id}: Real card data required from frontend.`);
      }
    }

    // Bildirimlerde göstermek üzere hizmet isimlerini birleştir
    const serviceNames = createdAppointments.map(a => a.service.name).join(' & ');
    const firstAppointment = createdAppointments[0];

    // Asenkron e-posta bildirimi
    if (customer.email) {
      try {
        await addNotificationJob({
          tenantId: req.tenant!.id,
          type: 'EMAIL',
          recipient: customer.email,
          templateName: 'appointment_created_email',
          variables: {
            salonName: req.tenant!.name,
            clientName: customer.name,
            serviceName: serviceNames,
            dateTime: firstAppointment.dateTime.toLocaleString('tr-TR'),
          }
        });
      } catch (e: any) {
        console.warn('Queue notification email failed:', e.message);
      }
    }

    // Asenkron SMS bildirimi
    try {
      await addNotificationJob({
        tenantId: req.tenant!.id,
        type: 'SMS',
        recipient: customer.phone,
        templateName: 'appointment_created_sms',
        variables: {
          salonName: req.tenant!.name,
          clientName: customer.name,
          serviceName: serviceNames,
          dateTime: firstAppointment.dateTime.toLocaleString('tr-TR'),
        }
      });
    } catch (e: any) {
      console.warn('Queue notification SMS failed:', e.message);
    }

    // Asenkron WhatsApp bildirimi
    try {
      await addNotificationJob({
        tenantId: req.tenant!.id,
        type: 'WHATSAPP',
        recipient: customer.phone,
        templateName: 'appointment_created_wa',
        variables: {
          salonName: req.tenant!.name,
          clientName: customer.name,
          serviceName: serviceNames,
          dateTime: firstAppointment.dateTime.toLocaleString('tr-TR'),
        }
      });
    } catch (e: any) {
      console.warn('Queue notification WA failed:', e.message);
    }

    return res.status(201).json({
      success: true,
      data: {
        appointmentId: firstAppointment.id,
        appointmentIds: createdAppointments.map(a => a.id),
        status: firstAppointment.status,
        message: 'Randevu başarıyla oluşturuldu.'
      }
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[CreateAppointment] Error:', errMessage);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Randevu kaydedilemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 3.5. SALON PROFİLİ (GET /api/appointments/profile)
// ==========================================
router.get('/profile', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomain: true,
        customDomain: true,
        plan: { select: { name: true } }
      }
    });

    const settings = await tenantPrisma.tenantSettings.findFirst();

    const services = await tenantPrisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true
      }
    });

    const staff = await tenantPrisma.staff.findMany({
      where: {
        isActive: true,
        tenantId: req.tenant!.id
      },
      select: {
        id: true,
        name: true,
        title: true,
        phone: true,
        avatar: true
      }
    });

    const dbGallery = await tenantPrisma.media.findMany({
      take: 6,
      select: { url: true }
    });
    
    const defaultGallery = [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595894155162-e0705b0d723a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop"
    ];

    const gallery = dbGallery.length > 0 ? dbGallery.map((m: any) => m.url) : defaultGallery;

    res.json({
      success: true,
      data: {
        name: tenant?.name || 'Salon',
        description: settings?.heroSubtitle || 'Premium saç kesimi, renklendirme ve stil hizmetleri.',
        theme: 'dark', // Premium vizyon gereği koyu tema
        themeTemplate: settings?.themeTemplate || 'template-minimalist',
        portalThemeTier: settings?.portalThemeTier || 'BASIC',
        portalColorMode: settings?.portalColorMode || 'DARK',
        heroTitle: settings?.heroTitle || tenant?.name || 'Salon',
        heroSubtitle: settings?.heroSubtitle || 'Nişantaşı\'nda Premium Saç Tasarımı ve Kişiye Özel Stil Deneyimi',
        aboutText: settings?.aboutText || '',
        instagramUrl: settings?.instagramUrl || '',
        coverImage: settings?.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
        logo: settings?.logo || '',
        globalPaymentPolicy: settings?.globalPaymentPolicy || 'DEPOSIT',
        defaultDepositAmount: settings?.defaultDepositAmount ? Number(settings.defaultDepositAmount) : 150.00,
        services,
        staff,
        gallery
      }
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[TenantProfile] Error:', errMessage);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Salon bilgileri yüklenemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 3.6. CMS AYARLARI GETİRME (GET /api/appointments/settings)
// ==========================================
router.get('/settings', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);
    
    let settings = await tenantPrisma.tenantSettings.findFirst();

    if (!settings) {
      settings = await tenantPrisma.tenantSettings.create({
        data: {
          tenantId,
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: false,
          themeTemplate: 'template-minimalist',
          portalThemeTier: 'BASIC',
          portalColorMode: 'DARK',
          heroTitle: req.tenant!.name,
          heroSubtitle: 'Premium Güzellik ve Saç Tasarım Salonu',
          aboutText: '',
          instagramUrl: '',
          coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop'
        }
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true }
    });

    const isPaidOrElite = tenant?.plan?.allowPortalThemes || tenant?.plan?.name === 'ELITE' || tenant?.plan?.name === 'PRO';

    res.json({
      success: true,
      data: {
        ...settings,
        plan: tenant?.plan?.name || 'FREE',
        allowPortalThemes: Boolean(isPaidOrElite)
      }
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[GetSettings] Error:', errMessage);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Salon ayarları yüklenemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 3.7. CMS AYARLARI GÜNCELLEME (PUT /api/appointments/settings)
// ==========================================
router.put('/settings', requireAuth, requireTenantAdmin, async (req: AuthRequest, res: Response) => {
  const {
    themeTemplate,
    portalThemeTier,
    portalColorMode,
    heroTitle,
    heroSubtitle,
    aboutText,
    instagramUrl,
    coverImage,
    logo,
    globalPaymentPolicy,
    emailEnabled,
    smsEnabled,
    whatsappEnabled,
    requiredDepositAmount,
    defaultDepositAmount,
    noShowLimit,
    customPaymentGateway,
    posProviderName,
    storefrontMode,
    selectedThemeId,
    enableReengagementBot,
    reengagementDays,
    enableBirthdayBot,
    enableLoyaltySystem,
    loyaltyTargetStamps,
    loyaltyRewardText,
    workingHours
  } = req.body;

  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    let settings = await tenantPrisma.tenantSettings.findFirst();

    if (!settings) {
      // Eğer ayar kaydı yoksa oluşturarak güncelle
      settings = await tenantPrisma.tenantSettings.create({
        data: {
          tenantId,
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
          whatsappEnabled: whatsappEnabled !== undefined ? whatsappEnabled : false,
          themeTemplate: themeTemplate || 'template-minimalist',
          storefrontMode: storefrontMode || 'SIMPLE',
          selectedThemeId: selectedThemeId || 'SIMPLE_MINIMALIST',
          portalThemeTier: portalThemeTier || 'BASIC',
          portalColorMode: portalColorMode || 'DARK',
          heroTitle: heroTitle || req.tenant!.name,
          heroSubtitle: heroSubtitle || 'Premium Güzellik ve Saç Tasarım Salonu',
          aboutText: aboutText || '',
          instagramUrl: instagramUrl || '',
          coverImage: coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
          logo: logo || '',
          globalPaymentPolicy: globalPaymentPolicy || 'DEPOSIT',
          requiredDepositAmount: requiredDepositAmount !== undefined ? requiredDepositAmount : 0.00,
          defaultDepositAmount: defaultDepositAmount !== undefined ? defaultDepositAmount : 150.00,
          noShowLimit: noShowLimit !== undefined ? noShowLimit : 1,
          customPaymentGateway: customPaymentGateway !== undefined ? customPaymentGateway : false,
          posProviderName: posProviderName || 'iyzico',
          enableReengagementBot: enableReengagementBot !== undefined ? !!enableReengagementBot : true,
          reengagementDays: reengagementDays !== undefined ? parseInt(reengagementDays) : 35,
          enableBirthdayBot: enableBirthdayBot !== undefined ? !!enableBirthdayBot : true,
          enableLoyaltySystem: enableLoyaltySystem !== undefined ? !!enableLoyaltySystem : true,
          loyaltyTargetStamps: loyaltyTargetStamps !== undefined ? parseInt(loyaltyTargetStamps) : 10,
          loyaltyRewardText: loyaltyRewardText || '1 Bakım Ücretsiz',
          workingHours: workingHours || undefined
        }
      });
    }

    const updatedSettings = await tenantPrisma.tenantSettings.update({
      where: { id: settings.id },
      data: {
        themeTemplate: themeTemplate !== undefined ? themeTemplate : settings.themeTemplate,
        portalThemeTier: portalThemeTier !== undefined ? portalThemeTier : settings.portalThemeTier,
        portalColorMode: portalColorMode !== undefined ? portalColorMode : settings.portalColorMode,
        heroTitle: heroTitle !== undefined ? heroTitle : settings.heroTitle,
        heroSubtitle: heroSubtitle !== undefined ? heroSubtitle : settings.heroSubtitle,
        aboutText: aboutText !== undefined ? aboutText : settings.aboutText,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : settings.instagramUrl,
        coverImage: coverImage !== undefined ? coverImage : settings.coverImage,
        logo: logo !== undefined ? logo : settings.logo,
        globalPaymentPolicy: globalPaymentPolicy !== undefined ? globalPaymentPolicy : settings.globalPaymentPolicy,
        emailEnabled: emailEnabled !== undefined ? emailEnabled : settings.emailEnabled,
        smsEnabled: smsEnabled !== undefined ? smsEnabled : settings.smsEnabled,
        whatsappEnabled: whatsappEnabled !== undefined ? whatsappEnabled : settings.whatsappEnabled,
        requiredDepositAmount: requiredDepositAmount !== undefined ? requiredDepositAmount : settings.requiredDepositAmount,
        defaultDepositAmount: defaultDepositAmount !== undefined ? defaultDepositAmount : settings.defaultDepositAmount,
        noShowLimit: noShowLimit !== undefined ? noShowLimit : settings.noShowLimit,
        customPaymentGateway: customPaymentGateway !== undefined ? customPaymentGateway : settings.customPaymentGateway,
        posProviderName: posProviderName !== undefined ? posProviderName : settings.posProviderName,
        storefrontMode: storefrontMode !== undefined ? storefrontMode : settings.storefrontMode,
        selectedThemeId: selectedThemeId !== undefined ? selectedThemeId : settings.selectedThemeId,
        enableReengagementBot: enableReengagementBot !== undefined ? !!enableReengagementBot : settings.enableReengagementBot,
        reengagementDays: reengagementDays !== undefined ? parseInt(reengagementDays) : settings.reengagementDays,
        enableBirthdayBot: enableBirthdayBot !== undefined ? !!enableBirthdayBot : settings.enableBirthdayBot,
        enableLoyaltySystem: enableLoyaltySystem !== undefined ? !!enableLoyaltySystem : settings.enableLoyaltySystem,
        loyaltyTargetStamps: loyaltyTargetStamps !== undefined ? parseInt(loyaltyTargetStamps) : settings.loyaltyTargetStamps,
        loyaltyRewardText: loyaltyRewardText !== undefined ? loyaltyRewardText : settings.loyaltyRewardText,
        workingHours: workingHours !== undefined ? workingHours : (settings as any).workingHours
      }
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Salon ayarları başarıyla güncellendi.'
    } as ApiResponse);

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[UpdateSettings] Error:', errMessage);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Salon ayarları güncellenemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 4. KARA LİSTE KONTROLÜ (GET /api/appointments/check-blacklist)
// ==========================================
router.get('/check-blacklist', requireTenant, async (req: TenantRequest, res: Response) => {
  const phone = req.query.phone as string;
  const serviceId = req.query.serviceId as string;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Telefon numarası zorunludur.' }
    } as ApiResponse);
  }

  try {
    const tenantPrisma = getTenantPrisma(req.tenant!.id);

    // GÜVENLİK: tenantId filtresi zorunlu — başka tenant'ın müşterisi eşleşmemeli
    const customer = await tenantPrisma.customer.findFirst({
      where: { phone, tenantId: req.tenant!.id }
    });

    const settings = await tenantPrisma.tenantSettings.findFirst();
    const defaultDepositAmount = settings?.defaultDepositAmount ? Number(settings.defaultDepositAmount) : 150.00;
    const policy = settings?.globalPaymentPolicy ?? 'DEPOSIT';

    let requiresDeposit = true;
    if (customer) {
      requiresDeposit = customer.requiresDeposit;
    } else {
      requiresDeposit = policy !== 'NONE';
    }

    let depositAmount = 0;
    if (requiresDeposit) {
      if (policy === 'FULL_PRICE') {
        if (serviceId) {
          const service = await tenantPrisma.service.findUnique({
            where: { id: serviceId }
          });
          depositAmount = service?.price ? Number(service.price) : 0;
        }
      } else { // 'DEPOSIT'
        depositAmount = defaultDepositAmount;
        if (depositAmount === 0) {
          requiresDeposit = false;
        }
      }
    }

    res.json({
      success: true,
      data: {
        isBlocked: customer?.isBlacklisted ?? false,
        requiresDeposit,
        noShowCount: customer?.noShowCount ?? 0,
        depositAmount
      }
    } as ApiResponse);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[BlacklistCheck] Error:', errMessage);
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Veritabanı işlemi gerçekleştirilemedi.' }
    } as ApiResponse);
  }
});

// ==========================================
// 6. ADİSYON KAPATMA / ÖDEME AL (POST /api/appointments/:id/checkout)
// ==========================================
router.post('/:id/checkout', requireAuth, requireTenant, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { paymentMethod, paidAmount } = req.body;

  if (!paymentMethod || paidAmount === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Ödeme yöntemi ve tahsil edilen tutar zorunludur.' }
    } as ApiResponse);
  }

  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    // 1. Randevuyu ve ilişkili personeli sorgula
    const appointment = await tenantPrisma.appointment.findFirst({
      where: { id, tenantId },
      include: { staff: true }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Randevu bulunamadı.' }
      } as ApiResponse);
    }

    const calculatedPaidAmount = parseFloat(paidAmount);
    let commissionEarned = 0;

    // 2. Personel varsa prim hesaplamasını yap
    if (appointment.staffId && appointment.staff) {
      const commissionRate = appointment.staff.commissionRate || 0;
      commissionEarned = calculatedPaidAmount * (commissionRate / 100);
    }

    // 3. Randevuyu güncelle
    const updated = await tenantPrisma.appointment.update({
      where: { id },
      data: {
        isPaid: true,
        status: 'COMPLETED',
        paymentMethod,
        paidAmount: calculatedPaidAmount,
        staffCommissionEarned: commissionEarned
      }
    });

    // 4. Müşteri Son Randevu Tarihi ve Sadakat Damgası Güncelleme
    const tenant = await tenantPrisma.tenant.findUnique({
      where: { id: tenantId },
      include: { settings: true }
    });

    const customer = await tenantPrisma.customer.findUnique({
      where: { id: appointment.customerId }
    });

    if (customer) {
      const enableLoyalty = tenant?.settings?.enableLoyaltySystem ?? true;
      const target = tenant?.settings?.loyaltyTargetStamps ?? 10;
      const rewardText = tenant?.settings?.loyaltyRewardText ?? "1 Bakım Ücretsiz";

      let newStamps = customer.loyaltyStamps || 0;
      if (enableLoyalty) {
        newStamps += 1;
        if (newStamps >= target) {
          newStamps = 0;
          const msg = `🎉 Tebrikler! ${tenant?.name || 'Kuaför'} salonumuzda ${target} randevuyu tamamlayarak '${rewardText}' ödülü kazandınız! Bir sonraki gelişinizde kullanabilirsiniz.`;
          console.log(`[WhatsAppService] [SIMULATOR] WhatsApp message sent to customer ${customer.phone}: "${msg}"`);
          
          try {
            // Sadakat kartı tamamlama kaydını oluştur
            await tenantPrisma.loyaltyCard.create({
              data: {
                tenantId,
                customerId: customer.id,
                totalStamps: target,
                isCompleted: true,
                completedAt: new Date()
              }
            });
          } catch (err) {
            console.error('[LoyaltyCard Create Error]:', err);
          }
        }
      }

      await tenantPrisma.customer.update({
        where: { id: appointment.customerId },
        data: {
          lastAppointmentAt: new Date(),
          loyaltyStamps: newStamps
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    } as ApiResponse);

  } catch (error: any) {
    console.error('[AppointmentCheckout] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Adisyon kapatılırken hata oluştu.' }
    } as ApiResponse);
  }
});

export default router;

// NOT: Bu dosyadaki export default yukarıda (L862 öncesinde) yer almaktadır.
// Aşağıdaki duplicate route tanımları kaldırılmıştır:
// - GET /profile (duplicate of L556-645)
// - GET / (duplicate of L152-224)
// Bu tanımlar 'export default router' sonrasında yer aldığından Express'e hiç eklenmiyordu.
// Güvenlik ve bakım açısından temizlendi.

