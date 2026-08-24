"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantPrisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
__exportStar(require("@prisma/client"), exports);
// Standart global Prisma Client istemcisi (Super Admin vb. işlemler için)
exports.prisma = new client_1.PrismaClient();
/**
 * Belirli bir kiracı (tenant) için izole edilmiş Prisma Client döndürür.
 * Bu istemci üzerinden yapılan tüm model sorgularına otomatik olarak `tenantId` filtresi uygulanır.
 */
const getTenantPrisma = (tenantId) => {
    return exports.prisma.$extends({
        query: {
            customer: {
                async $allOperations({ operation, args, query }) {
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
            service: {
                async $allOperations({ operation, args, query }) {
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
            appointment: {
                async $allOperations({ operation, args, query }) {
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
            media: {
                async $allOperations({ operation, args, query }) {
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
            payment: {
                async $allOperations({ operation, args, query }) {
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
            tenantSettings: {
                async $allOperations({ operation, args, query }) {
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
            user: {
                async $allOperations({ operation, args, query }) {
                    // Çalışanlar/kullanıcılar sorgulanırken de kiracı izolasyonu uygulanır
                    const anyArgs = args;
                    anyArgs.where = anyArgs.where || {};
                    anyArgs.where.tenantId = tenantId;
                    return query(anyArgs);
                },
            },
        },
    });
};
exports.getTenantPrisma = getTenantPrisma;
