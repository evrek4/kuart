import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET!;

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
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1] || req.headers.cookie?.split('; ').find((row: string) => row.startsWith('kuafor-token='))?.split('=')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token bulunamadı.' } });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Geçersiz veya süresi dolmuş token.' } });
  }
}

export function requireTenantAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
  }

  if (!['TENANT', 'SUPER_ADMIN', 'SUB_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Yetkisiz rol.' } });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    if (req.user.tenantId !== req.tenant?.id) {
      return res.status(403).json({ success: false, error: { code: 'TENANT_MISMATCH', message: 'Farklı bir salona erişim yetkiniz yok.' } });
    }
  }

  next();
}

export function requireSuperAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Sadece süper adminler erişebilir.' } });
  }
  next();
}
