import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret_key_12345';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
    email: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    mediaCapacity: number | bigint;
  };
}

export function requireAuth(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Yetkilendirme hatası: Token bulunamadı.' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Yetkilendirme hatası: Geçersiz token.' } });
  }
}

export function requireTenantAdmin(req: any, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== 'TENANT_ADMIN' && req.user.role !== 'TENANT' && req.user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Erişim reddedildi: Bu işlem için TENANT veya TENANT_ADMIN yetkisi gereklidir.' } });
    }
    
    // Strict Tenant Isolation
    if (!req.tenant) {
      req.tenant = { id: req.user.tenantId } as any;
    } else {
      req.tenant.id = req.user.tenantId;
    }
    
    next();
  });
}

export function requireSuperAdmin(req: any, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Erişim reddedildi: Bu işlem için SUPER_ADMIN yetkisi gereklidir.' } });
    }
    next();
  });
}
