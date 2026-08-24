import { prisma } from '@kuafor-art/database';

const roundToTwo = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Kuaförün finansal durumunu (kasa özeti) hesaplar.
 * Sanal POS gelirleri, nakit beklentileri ve platform komisyonlarını içerir.
 */
export async function calculateTenantBalance(tenantId: string) {
  // 1. Kiracı Abonelik Paket Bilgisini Çek
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true, name: true }
  });

  if (!tenant) {
    throw new Error('Salon bulunamadı.');
  }

  // 2. Başarılı Sanal POS Ödemelerini Sorgula (Kapora ve Tam Ödemeler)
  const successfulPayments = await prisma.payment.findMany({
    where: {
      tenantId,
      status: 'SUCCESSFUL'
    },
    select: {
      amount: true,
      type: true
    }
  });

  // Toplam Sanal POS geliri (Hassas yuvarlama)
  const posRevenue = successfulPayments.reduce(
    (sum: number, p: any) => roundToTwo(sum + Number(p.amount)),
    0
  );

  // Sadece kapora olarak alınan Sanal POS geliri
  const depositRevenue = successfulPayments
    .filter((p: any) => p.type === 'DEPOSIT')
    .reduce((sum: number, p: any) => roundToTwo(sum + Number(p.amount)), 0);

  // 3. Nakit Ödeme Beklentilerini Hesapla
  // Onaylı veya tamamlanmış randevulardan, Sanal POS ile tahsil edilmeyen kısımlar
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { in: ['CONFIRMED', 'COMPLETED'] }
    },
    include: {
      payments: {
        where: { status: 'SUCCESSFUL' }
      },
      service: {
        select: { price: true }
      }
    }
  });

  let cashExpectation = 0;

  for (const app of appointments) {
    const totalServicePrice = Number(app.service.price);
    const successfulPosPayments = app.payments;

    if (successfulPosPayments.length === 0) {
      // Hiç POS ödemesi yoksa, tamamı nakit bekleniyor
      cashExpectation = roundToTwo(cashExpectation + totalServicePrice);
    } else {
      // Eğer kapora gibi kısmi bir ödeme varsa, kalan miktar nakit beklenir
      const totalPaidViaPos = successfulPosPayments.reduce(
        (sum: number, p: any) => roundToTwo(sum + Number(p.amount)),
        0
      );
      const remainingAmount = roundToTwo(totalServicePrice - totalPaidViaPos);

      if (remainingAmount > 0) {
        cashExpectation = roundToTwo(cashExpectation + remainingAmount);
      }
    }
  }

  // 4. Platform Komisyonu Hesaplama
  // PRO plan kullanan salonlarda Sanal POS üzerinden %5 komisyon kesilir.
  // ELITE planda komisyon %0'dır.
  const commissionRate = tenant.plan?.name === 'PRO' ? 0.05 : 0;
  const platformCommission = roundToTwo(posRevenue * commissionRate);

  // Net Kasa Bakiyesi (POS Geliri - Platform Komisyonu)
  const netPosBalance = roundToTwo(posRevenue - platformCommission);

  const roundedPosRevenue = roundToTwo(posRevenue);
  const roundedDepositRevenue = roundToTwo(depositRevenue);
  const roundedCashExpectation = roundToTwo(cashExpectation);

  return {
    plan: tenant.plan?.name || 'FREE',
    posRevenue: roundedPosRevenue,
    depositRevenue: roundedDepositRevenue,
    cashExpectation: roundedCashExpectation,
    platformCommission,
    netPosBalance,
    totalExpectedRevenue: roundToTwo(netPosBalance + roundedCashExpectation)
  };
}

