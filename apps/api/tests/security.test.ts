jest.mock('@kuafor-art/database', () => ({
  prisma: {},
  getTenantPrisma: jest.fn(),
  PrismaClient: jest.fn()
}));

import request from 'supertest';
import express, { Express } from 'express';
import jwt from 'jsonwebtoken';
import appointmentsRouter from '../src/routes/appointments';
import { requireTenant } from '../src/middlewares/tenant';
import { requireAuth, requireTenantAdmin, requireSuperAdmin, JWT_SECRET } from '../src/middlewares/auth';
import { redisConnection } from '../src/queues/connection';

describe('Security & Isolation Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock tenant middleware
    app.use((req: any, res, next) => {
      req.tenant = { id: req.headers['x-tenant-slug'] || 'tenant-a' };
      next();
    });

    app.use('/api/appointments', appointmentsRouter);
    
    // Mock admin routes
    const adminRouter = express.Router();
    adminRouter.post('/packages', requireSuperAdmin, (req, res) => res.status(200).json({ success: true }));
    app.use('/api/admin', adminRouter);
    
    // Mock general tenant route
    const customerRouter = express.Router();
    customerRouter.get('/', requireTenantAdmin, (req: any, res) => res.status(200).json({ tenantId: req.tenant.id }));
    app.use('/api/customers', customerRouter);
  });

  afterAll(async () => {
    // Clean up redis
    await redisConnection.quit();
  });

  describe('1. OTP/SMS Rate Limiting', () => {
    it('should block after 3 requests within 3 minutes', async () => {
      const phone = '5551234567';
      const tenantId = 'tenant-a';
      await redisConnection.del(`rl:otp:${tenantId}:ip:::ffff:127.0.0.1`);
      await redisConnection.del(`rl:otp:${tenantId}:phone:${phone}`);

      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post('/api/appointments/send-otp')
          .send({ phone })
          .set('x-tenant-slug', tenantId);
        expect(res.status).not.toBe(429);
      }

      const res4 = await request(app)
        .post('/api/appointments/send-otp')
        .send({ phone })
        .set('x-tenant-slug', tenantId);

      expect(res4.status).toBe(429);
      expect(res4.body.error.message).toContain('Çok fazla istek attınız');
    });
  });

  describe('2. Tenant Isolation (Strict Auth Check)', () => {
    it('should isolate tenants despite x-tenant-slug header', async () => {
      const tokenA = jwt.sign({ userId: 'u1', tenantId: 'tenant-a', role: 'TENANT_ADMIN' }, JWT_SECRET);
      
      const res = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${tokenA}`)
        .set('x-tenant-slug', 'tenant-b');
      
      expect(res.status).toBe(200);
      expect(res.body.tenantId).toBe('tenant-a');
    });
  });

  describe('3. Authorization (SuperAdmin Check)', () => {
    it('should forbid normal TENANT_ADMIN from accessing SUPER_ADMIN routes', async () => {
      const token = jwt.sign({ userId: 'u2', tenantId: 'tenant-c', role: 'TENANT_ADMIN' }, JWT_SECRET);
      
      const res = await request(app)
        .post('/api/admin/packages')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.status).toBe(403);
    });
    
    it('should allow SUPER_ADMIN', async () => {
      const token = jwt.sign({ userId: 'u3', tenantId: 'tenant-admin', role: 'SUPER_ADMIN' }, JWT_SECRET);
      
      const res = await request(app)
        .post('/api/admin/packages')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.status).toBe(200);
    });
  });
});
