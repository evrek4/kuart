import { Router, Response } from 'express';
import { getTenantPrisma } from '@kuafor-art/database';
import { requireTenant, TenantRequest } from '../middlewares/tenant';
import { ApiResponse } from '@kuafor-art/shared-types';

const router = Router();

// ==========================================
// 1. TÜM MÜŞTERİLERİ GETİR (GET /api/customers)
// ==========================================
router.get('/', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantPrisma = getTenantPrisma(req.tenant!.id);
    const search = req.query.search as string | undefined;

    const where: any = {};
    if (search && search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const customers = await tenantPrisma.customer.findMany({
      where,
      include: {
        appointments: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: search ? 10 : undefined
    });

    // Müşterileri mapleyerek tamamlanan randevu sayısını ve sadakat adayı olup olmadıklarını ekle
    const formattedCustomers = customers.map((customer: any) => {
      const completedCount = customer.appointments.filter((app: any) => app.status === 'COMPLETED').length;
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        noShowCount: customer.noShowCount,
        isBlacklisted: customer.isBlacklisted,
        requiresDeposit: customer.requiresDeposit,
        birthDate: customer.birthDate,
        loyaltyStamps: customer.loyaltyStamps,
        lastAppointmentAt: customer.lastAppointmentAt,
        lastMarketingSentAt: customer.lastMarketingSentAt,
        completedAppointmentsCount: completedCount,
        completedCount: completedCount, // Her iki frontend varyasyonunun çalışması için
        isLoyaltyCandidate: completedCount >= 3 && customer.requiresDeposit === true
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedCustomers
    } as ApiResponse);
  } catch (error: any) {
    console.error('[GetCustomers] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Müşteriler getirilirken hata oluştu.' }
    } as ApiResponse);
  }
});

// ==========================================
// 2. SADAKAT ADAYI MÜŞTERİLERİ GETİR (GET /api/customers/loyalty-candidates)
// ==========================================
router.get('/loyalty-candidates', requireTenant, async (req: TenantRequest, res: Response) => {
  try {
    const tenantPrisma = getTenantPrisma(req.tenant!.id);

    const customers = await tenantPrisma.customer.findMany({
      where: {
        requiresDeposit: true
      },
      include: {
        appointments: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    });

    // Sadece COMPLETED randevu sayısı >= 3 olanları filtrele
    const candidates = customers
      .map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        noShowCount: customer.noShowCount,
        isBlacklisted: customer.isBlacklisted,
        requiresDeposit: customer.requiresDeposit,
        completedAppointmentsCount: customer.appointments.length
      }))
      .filter((c: any) => c.completedAppointmentsCount >= 3);

    return res.status(200).json({
      success: true,
      data: candidates
    } as ApiResponse);
  } catch (error: any) {
    console.error('[GetLoyaltyCandidates] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Sadakat adayları getirilirken hata oluştu.' }
    } as ApiResponse);
  }
});

// ==========================================
// 2.5 YENİ MÜŞTERİ EKLE (POST /api/customers)
// ==========================================
router.post('/', requireTenant, async (req: TenantRequest, res: Response) => {
  const { name, email, phone, birthDate } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Müşteri adı ve telefon numarası zorunludur.' },
    } as ApiResponse);
  }

  try {
    const tenantId = req.tenant!.id;
    const tenantPrisma = getTenantPrisma(tenantId);

    const existingCustomer = await tenantPrisma.customer.findFirst({
      where: { phone, tenantId },
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Bu telefon numarasıyla kayıtlı bir müşteri zaten mevcut.' },
      } as ApiResponse);
    }

    const settings = await tenantPrisma.tenantSettings.findFirst();
    const globalPolicy = settings?.globalPaymentPolicy || 'DEPOSIT';

    const customer = await tenantPrisma.customer.create({
      data: {
        tenantId,
        name,
        email: email || null,
        phone,
        noShowCount: 0,
        isBlacklisted: false,
        requiresDeposit: globalPolicy !== 'NONE',
        birthDate: birthDate ? new Date(birthDate) : null
      },
    });

    return res.status(201).json({
      success: true,
      data: customer,
      message: 'Müşteri başarıyla kaydedildi.',
    } as ApiResponse);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('[CreateCustomer] Error:', errMessage);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Müşteri kaydedilemedi.' },
    } as ApiResponse);
  }
});

// ==========================================
// 3. MÜŞTERİ GÜNCELLE (PUT /api/customers/:id)
// ==========================================
router.put('/:id', requireTenant, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { requiresDeposit, name, email, phone, isBlacklisted, noShowCount, birthDate, loyaltyStamps } = req.body;

  try {
    const tenantPrisma = getTenantPrisma(req.tenant!.id);

    // Müşterinin bu kiracıya ait olup olmadığını doğrula (tenantId filtresi ile gerçek izolasyon)
    const existing = await tenantPrisma.customer.findFirst({
      where: { id, tenantId: req.tenant!.id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'CUSTOMER_NOT_FOUND', message: 'Müşteri bulunamadı.' }
      } as ApiResponse);
    }

    const updated = await tenantPrisma.customer.update({
      where: { id },
      data: {
        requiresDeposit: requiresDeposit !== undefined ? requiresDeposit : existing.requiresDeposit,
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        isBlacklisted: isBlacklisted !== undefined ? isBlacklisted : existing.isBlacklisted,
        noShowCount: noShowCount !== undefined ? noShowCount : existing.noShowCount,
        birthDate: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : existing.birthDate,
        loyaltyStamps: loyaltyStamps !== undefined ? parseInt(loyaltyStamps) : existing.loyaltyStamps
      }
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Müşteri bilgileri başarıyla güncellendi.'
    } as ApiResponse);
  } catch (error: any) {
    console.error('[UpdateCustomer] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Müşteri güncellenirken hata oluştu.' }
    } as ApiResponse);
  }
});

export default router;
