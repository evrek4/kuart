import { Router } from 'express';
import { calculateTenantBalance } from '../services/finance';
import { getTenantPrisma } from '@kuafor-art/database';

const router = Router();

// =====================================================
// GET /api/finance/summary
// Salon kasa özeti: POS geliri, nakit beklentisi, platform komisyonu
// =====================================================
router.get('/summary', async (req: any, res: any) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: { message: 'Salon bilgisi bulunamadı.' } });
    }

    const balance = await calculateTenantBalance(tenantId);
    return res.json({ success: true, data: balance });
  } catch (error: any) {
    console.error('[Finance/Summary] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FINANCE_ERROR', message: error.message || 'Kasa özeti hesaplanamadı.' }
    });
  }
});

// =====================================================
// GET /api/finance/staff-commissions
// Personel bazlı prim/komisyon raporu (tarih aralığı filtrelemeli)
// Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// =====================================================
router.get('/staff-commissions', async (req: any, res: any) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: { message: 'Salon bilgisi bulunamadı.' } });
    }

    const { startDate, endDate } = req.query;

    // Tarih filtresi oluştur
    const now = new Date();
    const start = startDate
      ? new Date(startDate as string)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const tenantPrisma = getTenantPrisma(tenantId);

    // Tüm aktif personeli al
    const staffList = await tenantPrisma.staff.findMany({
      where: { tenantId, isActive: true }
    });

    // Tamamlanmış ve ödeme yöntemi olan randevuları al (personel bazlı)
    const appointments = await tenantPrisma.appointment.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        dateTime: { gte: start, lte: end }
      },
      include: {
        service: { select: { price: true } }
      }
    });

    // Personel bazlı rapor oluştur
    const report = staffList.map((staff: any) => {
      const staffAppointments = appointments.filter(
        (a: any) => a.staffId === staff.id
      );

      const totalRevenue = staffAppointments.reduce((sum: number, a: any) => {
        const price = a.paidAmount || Number(a.service?.price) || 0;
        return sum + price;
      }, 0);

      const commissionRate = staff.commissionRate || 0;
      const totalCommission = Math.round(totalRevenue * (commissionRate / 100) * 100) / 100;

      return {
        staffId: staff.id,
        name: staff.name,
        title: staff.title || 'Personel',
        commissionRate,
        totalAppointments: staffAppointments.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission
      };
    });

    // Özet hesapla
    const totalCiro = report.reduce((s: number, r: any) => s + r.totalRevenue, 0);
    const totalDistributedCommission = report.reduce((s: number, r: any) => s + r.totalCommission, 0);

    // Nakit / Kart / Havale ayrımı (paymentMethod alanından)
    const cashRevenue = appointments
      .filter((a: any) => a.paymentMethod === 'CASH' || a.paymentMethod === 'N/A' || !a.paymentMethod)
      .reduce((s: number, a: any) => s + (a.paidAmount || Number(a.service?.price) || 0), 0);

    const cardRevenue = appointments
      .filter((a: any) => a.paymentMethod === 'CARD' || a.paymentMethod === 'POS')
      .reduce((s: number, a: any) => s + (a.paidAmount || Number(a.service?.price) || 0), 0);

    const transferRevenue = appointments
      .filter((a: any) => a.paymentMethod === 'TRANSFER' || a.paymentMethod === 'EFT')
      .reduce((s: number, a: any) => s + (a.paidAmount || Number(a.service?.price) || 0), 0);

    return res.json({
      success: true,
      data: {
        report,
        summary: {
          totalCiro: Math.round(totalCiro * 100) / 100,
          cashRevenue: Math.round(cashRevenue * 100) / 100,
          cardRevenue: Math.round(cardRevenue * 100) / 100,
          transferRevenue: Math.round(transferRevenue * 100) / 100,
          totalDistributedCommission: Math.round(totalDistributedCommission * 100) / 100
        },
        period: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        }
      }
    });
  } catch (error: any) {
    console.error('[Finance/StaffCommissions] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FINANCE_ERROR', message: error.message || 'Personel prim raporu oluşturulamadı.' }
    });
  }
});

// =====================================================
// GET /api/finance/transactions
// Kasa işlem geçmişi (tamamlanan randevu bazlı)
// Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&staffId=<uuid>&paymentMethod=CASH|CARD|TRANSFER
// =====================================================
router.get('/transactions', async (req: any, res: any) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(401).json({ success: false, error: { message: 'Salon bilgisi bulunamadı.' } });
    }

    const { startDate, endDate, staffId, paymentMethod } = req.query;

    const now = new Date();
    const start = startDate
      ? new Date(startDate as string)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const tenantPrisma = getTenantPrisma(tenantId);

    const whereClause: any = {
      tenantId,
      status: 'COMPLETED',
      dateTime: { gte: start, lte: end }
    };

    if (staffId) whereClause.staffId = staffId as string;
    if (paymentMethod) whereClause.paymentMethod = paymentMethod as string;

    const transactions = await tenantPrisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, price: true } },
        staff: { select: { name: true } }
      },
      orderBy: { dateTime: 'desc' }
    });

    const formatted = transactions.map((t: any) => ({
      id: t.id,
      dateTime: t.dateTime,
      customerName: t.customer?.name || 'Bilinmiyor',
      customerPhone: t.customer?.phone || '',
      serviceName: t.service?.name || '',
      servicePrice: Number(t.service?.price) || 0,
      staffName: t.staff?.name || 'Atanmamış',
      paymentMethod: t.paymentMethod || 'N/A',
      paidAmount: t.paidAmount || Number(t.service?.price) || 0,
      isPaid: t.isPaid
    }));

    return res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('[Finance/Transactions] Error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FINANCE_ERROR', message: error.message || 'İşlem geçmişi alınamadı.' }
    });
  }
});

export default router;
