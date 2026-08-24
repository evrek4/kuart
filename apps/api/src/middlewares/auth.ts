import { Request, Response, NextFunction } from 'express';

export const JWT_SECRET = 'mock_secret_key_12345';

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
  req.user = { userId: "user-123", tenantId: "tenant-123", role: "SUPER_ADMIN", email: "admin@kuafor.art" };
  next();
}

export function requireTenantAdmin(req: any, res: Response, next: NextFunction) {
  next();
}

export function requireSuperAdmin(req: any, res: Response, next: NextFunction) {
  next();
}
