import { Router } from 'express';
import { prisma } from '@kuafor-art/database';

const router = Router();

// GET /api/public/landing
router.get('/landing', async (req, res) => {
  try {
    let data = await prisma.landingPageConfig.findFirst({
      where: { isPublished: true }
    });
    if (!data) {
      data = await prisma.landingPageConfig.findFirst();
    }
    if (!data) {
      data = await prisma.landingPageConfig.create({
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
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.json({
      success: true,
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { message: error?.message || 'Failed to fetch landing payload' }
    });
  }
});

export default router;
