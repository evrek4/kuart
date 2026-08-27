import { Router } from 'express';
import { prisma } from '@kuafor-art/database';

const router = Router();

// GET /api/directory/salons
// Anonim erişime açık - Kimlik doğrulama gerektirmez
router.get('/salons', async (req, res) => {
  try {
    // 1. İzole Güvenlik: Modül açık mı kontrol et
    const globalSettings = await prisma.globalSettings.findFirst();
    if (!globalSettings || !globalSettings.isDirectoryEnabled) {
      return res.status(403).json({
        success: false,
        error: { message: 'Kuaför rehberi modülü şu anda devre dışıdır.' }
      });
    }

    const { province, district } = req.query;

    // Filtreleri oluştur
    const filters: any = { isActive: true };
    if (province) filters.province = String(province);
    if (district) filters.district = String(district);

    // 2. Salonları çek - settings join edilerek logo ve coverImage alınır
    const tenants = await prisma.tenant.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        province: true,
        district: true,
        fullAddress: true,
        promotedLevel: true,
        promotedUntil: true,
        // Salon sahibinin telefon numarası
        users: {
          where: { role: 'TENANT' },
          select: { phone: true },
          take: 1
        },
        // Logo ve kapak fotoğrafı için TenantSettings'e join yap
        settings: {
          select: {
            logo: true,
            coverImage: true,
            heroTitle: true
          }
        }
      }
    });

    const now = new Date();

    // 3. Sıralama (Sorting) Algoritması
    // Önce öne çıkarılmış (promotedUntil > now) salonlar,
    // içlerinde: ilçe aramasında DISTRICT > PROVINCE, ardından Normal
    const sortedTenants = tenants.sort((a: any, b: any) => {
      const aIsPromoted = a.promotedUntil && new Date(a.promotedUntil) > now && a.promotedLevel !== 'NONE';
      const bIsPromoted = b.promotedUntil && new Date(b.promotedUntil) > now && b.promotedLevel !== 'NONE';

      // İkisi de öne çıkmışsa kendi aralarında sırala
      if (aIsPromoted && bIsPromoted) {
        if (district) {
          // İlçe aramasında: DISTRICT > PROVINCE
          if (a.promotedLevel === 'DISTRICT' && b.promotedLevel !== 'DISTRICT') return -1;
          if (a.promotedLevel !== 'DISTRICT' && b.promotedLevel === 'DISTRICT') return 1;
        } else if (province) {
          // Sadece il aramasında: PROVINCE > DISTRICT
          if (a.promotedLevel === 'PROVINCE' && b.promotedLevel !== 'PROVINCE') return -1;
          if (a.promotedLevel !== 'PROVINCE' && b.promotedLevel === 'PROVINCE') return 1;
        }
        return 0;
      }

      if (aIsPromoted) return -1;
      if (bIsPromoted) return 1;

      // Normal salonlar alfabetik
      return a.name.localeCompare(b.name, 'tr');
    });

    // 4. Response formatını hazırla
    const mappedTenants = sortedTenants.map((t: any) => {
      const isCurrentlyPromoted =
        t.promotedUntil &&
        new Date(t.promotedUntil) > now &&
        t.promotedLevel !== 'NONE';

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        customDomain: t.customDomain,
        province: t.province,
        district: t.district,
        fullAddress: t.fullAddress,
        promotedLevel: t.promotedLevel,
        promotedUntil: t.promotedUntil,
        isPromoted: Boolean(isCurrentlyPromoted),
        // Settings'ten gelen alanlar
        logo: t.settings?.logo ?? null,
        coverImage: t.settings?.coverImage ?? null,
        heroTitle: t.settings?.heroTitle ?? null,
        // Sahip telefonu
        phone: t.users?.[0]?.phone ?? null
      };
    });

    res.json({ success: true, data: mappedTenants });
  } catch (error: any) {
    console.error('[DirectoryAPI] Error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
