import { Request, Response, NextFunction } from 'express';
import { prisma } from '@kuafor-art/database';
import { slugify } from '../utils/slugify';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    mediaCapacity: number | bigint;
  };
}

export async function tenantMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    const slugHeader = req.headers['x-tenant-slug'] as string | undefined;
    let tenant = null;

    if (slugHeader) {
      const raw = decodeURIComponent(slugHeader).trim();
      const lower = raw.toLowerCase();
      const clean = slugify(raw);
      const legacy = lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { slug: raw },
            { slug: lower },
            { slug: clean },
            { slug: legacy },
            { subdomain: raw },
            { subdomain: lower },
            { subdomain: clean }
          ]
        },
      });
    }

    if (!tenant) {
      // Varsayılan ilk aktif tenant'ı al veya fallback nesnesi kullan
      tenant = await prisma.tenant.findFirst({
        where: { isActive: true },
      });
    }

    if (tenant) {
      req.tenant = {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
        mediaCapacity: tenant.mediaCapacity,
      };
    } else {
      req.tenant = {
        id: "tenant-123",
        name: "Art Kuaför",
        slug: "kuafor-art",
        isActive: true,
        mediaCapacity: 1024 * 1024 * 10,
      };
    }
  } catch (err) {
    // Veritabanı hatası durumunda fallback
    req.tenant = {
      id: "tenant-123",
      name: "Art Kuaför",
      slug: "kuafor-art",
      isActive: true,
      mediaCapacity: 1024 * 1024 * 10,
    };
  }
  next();
}

export function requireTenant(req: any, res: Response, next: NextFunction) {
  if (!req.tenant) {
    return res.status(400).json({
      success: false,
      error: { code: 'TENANT_REQUIRED', message: 'Kiracı bilgisi bulunamadı.' },
    });
  }
  next();
}
