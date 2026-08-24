import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

// Standart global Prisma Client istemcisi (Super Admin vb. işlemler için)
export const prisma = new PrismaClient();

/**
 * Belirli bir kiracı (tenant) için izole edilmiş Prisma Client döndürür.
 * Bu istemci üzerinden yapılan tüm model sorgularına otomatik olarak `tenantId` filtresi ve verisi uygulanır.
 */
export const getTenantPrisma = (tenantId: string) => {
  const applyTenantId = async (
    operation: string,
    args: Record<string, unknown>,
    query: (args: Record<string, unknown>) => Promise<unknown>
  ) => {
    const nextArgs = { ...args };

    if (operation === 'create') {
      const data = (nextArgs.data as Record<string, unknown>) || {};
      nextArgs.data = { ...data, tenantId };
    } else if (operation === 'createMany') {
      const data = nextArgs.data;
      if (Array.isArray(data)) {
        nextArgs.data = data.map((item: Record<string, unknown>) => ({ ...item, tenantId }));
      } else if (data && typeof data === 'object') {
        nextArgs.data = { ...data, tenantId };
      }
    } else if (operation === 'upsert') {
      const createData = (nextArgs.create as Record<string, unknown>) || {};
      nextArgs.create = { ...createData, tenantId };
      const whereData = (nextArgs.where as Record<string, unknown>) || {};
      nextArgs.where = { ...whereData, tenantId };
    } else {
      const whereData = (nextArgs.where as Record<string, unknown>) || {};
      nextArgs.where = { ...whereData, tenantId };
    }

    return query(nextArgs);
  };

  return prisma.$extends({
    query: {
      customer: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      service: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      appointment: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      media: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      payment: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      tenantSettings: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      user: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
      staff: {
        async $allOperations({ operation, args, query }) {
          return applyTenantId(
            operation,
            args as Record<string, unknown>,
            query as (args: Record<string, unknown>) => Promise<unknown>
          );
        },
      },
    },
  });
};
