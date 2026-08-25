"use strict";
// Dynamic In-Memory Mock Prisma Client
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.getTenantPrisma = getTenantPrisma;
let users = [
    {
        id: "user-123",
        email: "admin@kuafor.art",
        passwordHash: "$2b$10$2gy5udFIspC8YgUHultSeuQDGkN1PYKGMEbVF27V4SCJ2JXY1gOKK", // password123
        isActive: true,
        role: "SUPER_ADMIN",
        name: "Admin",
        phone: "0555 111 2233",
        tenantId: null
    },
    {
        id: "user-456",
        email: "ahmet@melekkuafor.com",
        passwordHash: "$2b$10$2gy5udFIspC8YgUHultSeuQDGkN1PYKGMEbVF27V4SCJ2JXY1gOKK", // password123
        isActive: true,
        role: "SALON_OWNER",
        name: "Ahmet Usta",
        phone: "0532 999 8811",
        tenantId: "tenant-456"
    }
];
let tenants = [
    {
        id: "tenant-123",
        name: "Art Kuaför",
        slug: "kuafor-art",
        subdomain: "kuaforart",
        customDomain: null,
        isActive: true,
        planId: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        mediaCapacity: 1024 * 1024 * 100
    },
    {
        id: "tenant-456",
        name: "Melek Kuaför",
        slug: "melek",
        subdomain: "melek",
        customDomain: "melekkuafor.com",
        isActive: true,
        planId: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
        mediaCapacity: 1024 * 1024 * 1024
    }
];
let marketingLogs = [];
let subscriptionPlans = [
    {
        id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
        name: "FREE",
        price: 0.0,
        storageLimitMB: 100,
        features: [],
        isFree: true,
        isActive: true,
        allowPortalThemes: false,
        maxAppointments: 50, // Aylık randevu limiti (null = sınırsız)
        maxStaff: 1 // Maksimum aktif personel sayısı
    },
    {
        id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
        name: "PRO",
        price: 499.0,
        storageLimitMB: 500,
        features: ["whatsapp_bot", "loyalty_system", "staff_commission", "marketing_bot", "coupon_engine"],
        isFree: false,
        isActive: true,
        allowPortalThemes: true,
        maxAppointments: null, // Sınırsız
        maxStaff: 10
    },
    {
        id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
        name: "ELITE",
        price: 999.0,
        storageLimitMB: 1024,
        features: ["custom_domain", "premium_themes", "whatsapp_bot", "loyalty_system", "staff_commission", "marketing_bot", "pdf_reports", "coupon_engine"],
        isFree: false,
        isActive: true,
        allowPortalThemes: true,
        maxAppointments: null, // Sınırsız
        maxStaff: null // Sınırsız
    }
];
let tenantSettingsList = [
    {
        id: "settings-123",
        tenantId: "tenant-123",
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: true,
        preferredNotificationChannel: "WHATSAPP",
        noShowLimit: 1,
        requiredDepositAmount: 100.0,
        globalPaymentPolicy: "DEPOSIT",
        themeTemplate: "template-minimalist",
        storefrontMode: "SIMPLE",
        selectedThemeId: "SIMPLE_MINIMALIST"
    },
    {
        id: "settings-456",
        tenantId: "tenant-456",
        emailEnabled: true,
        smsEnabled: true,
        whatsappEnabled: true,
        preferredNotificationChannel: "WHATSAPP",
        noShowLimit: 2,
        requiredDepositAmount: 150.0,
        globalPaymentPolicy: "DEPOSIT",
        themeTemplate: "template-luxury",
        storefrontMode: "PRO_PORTAL",
        selectedThemeId: "PORTAL_GOLD"
    }
];
let staffList = [
    {
        id: "staff-1",
        tenantId: "tenant-456",
        name: "Ahmet Usta",
        title: "Salon Sahibi",
        phone: "0532 999 8811",
        commissionRate: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
let servicesList = [
    {
        id: "service-1",
        tenantId: "tenant-456",
        name: "Saç Kesimi & Stil",
        description: "Kişiye özel modern saç kesimi",
        price: 350.0,
        duration: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
let customersList = [];
let appointmentsList = [];
let landingConfigs = [];
class MockPrisma {
    constructor() {
        this.user = {
            findFirst: async (args) => {
                if (!args || !args.where)
                    return users[0] || null;
                const { email, id, role } = args.where;
                let match = users.find((u) => {
                    if (email && u.email.toLowerCase() !== email.toLowerCase())
                        return false;
                    if (id && u.id !== id)
                        return false;
                    if (role && u.role !== role)
                        return false;
                    return true;
                });
                if (!match)
                    return null;
                if (args.include?.tenant) {
                    const tenant = tenants.find((t) => t.id === match.tenantId);
                    return { ...match, tenant: tenant || null };
                }
                return match;
            },
            findUnique: async (args) => {
                if (!args || !args.where)
                    return users[0] || null;
                const { email, id } = args.where;
                let match = users.find((u) => {
                    if (email && u.email.toLowerCase() !== email.toLowerCase())
                        return false;
                    if (id && u.id !== id)
                        return false;
                    return true;
                });
                if (!match)
                    return null;
                if (args.include?.tenant) {
                    const tenant = tenants.find((t) => t.id === match.tenantId);
                    return { ...match, tenant: tenant || null };
                }
                return match;
            },
            create: async (args) => {
                const newUser = {
                    id: args.data.id || `user-${Math.random().toString(36).substr(2, 9)}`,
                    email: args.data.email,
                    passwordHash: args.data.passwordHash,
                    name: args.data.name,
                    phone: args.data.phone || null,
                    role: args.data.role || "SALON_OWNER",
                    tenantId: args.data.tenantId || null,
                    isActive: args.data.isActive !== undefined ? args.data.isActive : true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                users.push(newUser);
                return newUser;
            },
            findMany: async (args) => {
                if (!args || !args.where)
                    return users;
                const { tenantId, role } = args.where;
                return users.filter((u) => {
                    if (tenantId && u.tenantId !== tenantId)
                        return false;
                    if (role && u.role !== role)
                        return false;
                    return true;
                });
            },
            update: async (args) => {
                const index = users.findIndex((u) => u.id === args.where.id);
                if (index !== -1) {
                    users[index] = { ...users[index], ...args.data, updatedAt: new Date() };
                    return users[index];
                }
                return null;
            }
        };
        this.tenant = {
            findUnique: async (args) => {
                if (!args || !args.where)
                    return tenants[0] || null;
                const { slug, id, customDomain, subdomain } = args.where;
                let match = tenants.find((t) => {
                    if (slug && t.slug !== slug)
                        return false;
                    if (id && t.id !== id)
                        return false;
                    if (customDomain && t.customDomain !== customDomain)
                        return false;
                    if (subdomain && t.subdomain !== subdomain)
                        return false;
                    return true;
                });
                if (!match)
                    return null;
                let result = match;
                if (args.include?.plan) {
                    const plan = subscriptionPlans.find((p) => p.id === match.planId);
                    result = { ...result, plan: plan || null };
                }
                if (args.include?.settings) {
                    const settings = tenantSettingsList.find((s) => s.tenantId === match.id);
                    result = { ...result, settings: settings || null };
                }
                return result;
            },
            findFirst: async (args) => {
                return this.tenant.findUnique(args);
            },
            create: async (args) => {
                const newTenant = {
                    id: args.data.id || `tenant-${Math.random().toString(36).substr(2, 9)}`,
                    name: args.data.name,
                    slug: args.data.slug,
                    subdomain: args.data.subdomain || null,
                    customDomain: args.data.customDomain || null,
                    planId: args.data.planId || subscriptionPlans[0].id,
                    mediaCapacity: args.data.mediaCapacity || 1024 * 1024 * 100,
                    isActive: args.data.isActive !== undefined ? args.data.isActive : true,
                    billingStatus: args.data.billingStatus || "ACTIVE",
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                tenants.push(newTenant);
                return newTenant;
            },
            findMany: async () => tenants,
            update: async (args) => {
                const index = tenants.findIndex((t) => t.id === args.where.id);
                if (index !== -1) {
                    tenants[index] = { ...tenants[index], ...args.data, updatedAt: new Date() };
                    return tenants[index];
                }
                return null;
            }
        };
        this.subscriptionPlan = {
            findFirst: async (args) => {
                if (!args || !args.where)
                    return subscriptionPlans[0];
                const { isFree, id, name } = args.where;
                let match = subscriptionPlans.find((p) => {
                    if (isFree !== undefined && p.isFree !== isFree)
                        return false;
                    if (id && p.id !== id)
                        return false;
                    if (name && p.name !== name)
                        return false;
                    return true;
                });
                return match || subscriptionPlans[0];
            },
            findUnique: async (args) => {
                if (!args || !args.where)
                    return subscriptionPlans[0];
                const { id, name } = args.where;
                return subscriptionPlans.find((p) => (id && p.id === id) || (name && p.name === name)) || null;
            },
            findMany: async () => subscriptionPlans,
            create: async (args) => {
                const newPlan = {
                    id: args.data.id || `plan-${Math.random().toString(36).substr(2, 9)}`,
                    name: args.data.name,
                    price: args.data.price,
                    storageLimitMB: args.data.storageLimitMB,
                    features: args.data.features || {},
                    isFree: args.data.isFree !== undefined ? args.data.isFree : false,
                    isActive: args.data.isActive !== undefined ? args.data.isActive : true,
                    allowPortalThemes: args.data.allowPortalThemes !== undefined ? args.data.allowPortalThemes : false,
                    maxAppointments: args.data.maxAppointments !== undefined ? args.data.maxAppointments : null,
                    maxStaff: args.data.maxStaff !== undefined ? args.data.maxStaff : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                subscriptionPlans.push(newPlan);
                return newPlan;
            },
            update: async (args) => {
                const index = subscriptionPlans.findIndex((p) => p.id === args.where.id);
                if (index !== -1) {
                    subscriptionPlans[index] = {
                        ...subscriptionPlans[index],
                        ...args.data,
                        updatedAt: new Date()
                    };
                    return subscriptionPlans[index];
                }
                return null;
            },
            delete: async (args) => {
                const index = subscriptionPlans.findIndex((p) => p.id === args.where.id);
                if (index !== -1) {
                    const deleted = subscriptionPlans[index];
                    subscriptionPlans.splice(index, 1);
                    return deleted;
                }
                return null;
            }
        };
        this.tenantSettings = {
            findFirst: async (args) => {
                if (!args || !args.where)
                    return tenantSettingsList[0];
                const { tenantId, id } = args.where;
                return tenantSettingsList.find((s) => (tenantId && s.tenantId === tenantId) || (id && s.id === id)) || null;
            },
            findUnique: async (args) => {
                return this.tenantSettings.findFirst(args);
            },
            create: async (args) => {
                const newSettings = {
                    id: `settings-${Math.random().toString(36).substr(2, 9)}`,
                    ...args.data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                tenantSettingsList.push(newSettings);
                return newSettings;
            },
            update: async (args) => {
                const index = tenantSettingsList.findIndex((s) => (args.where.id && s.id === args.where.id) || (args.where.tenantId && s.tenantId === args.where.tenantId));
                if (index !== -1) {
                    tenantSettingsList[index] = { ...tenantSettingsList[index], ...args.data, updatedAt: new Date() };
                    return tenantSettingsList[index];
                }
                return null;
            }
        };
        this.staff = {
            findMany: async (args) => {
                if (!args || !args.where)
                    return staffList;
                const { tenantId, isActive } = args.where;
                let result = staffList.filter((s) => {
                    if (tenantId && s.tenantId !== tenantId)
                        return false;
                    if (isActive !== undefined && s.isActive !== isActive)
                        return false;
                    return true;
                });
                if (args.orderBy?.createdAt === 'asc')
                    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                return result;
            },
            findUnique: async (args) => {
                if (!args?.where?.id)
                    return null;
                return staffList.find((s) => s.id === args.where.id) || null;
            },
            findFirst: async (args) => {
                if (!args?.where)
                    return staffList[0] || null;
                const { id, tenantId } = args.where;
                return staffList.find((s) => {
                    if (id && s.id !== id)
                        return false;
                    if (tenantId && s.tenantId !== tenantId)
                        return false;
                    return true;
                }) || null;
            },
            count: async (args) => {
                if (!args?.where)
                    return staffList.length;
                const { tenantId, isActive } = args.where;
                return staffList.filter((s) => {
                    if (tenantId && s.tenantId !== tenantId)
                        return false;
                    if (isActive !== undefined && s.isActive !== isActive)
                        return false;
                    return true;
                }).length;
            },
            create: async (args) => {
                const newStaff = {
                    id: `staff-${Math.random().toString(36).substr(2, 9)}`,
                    ...args.data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                staffList.push(newStaff);
                return newStaff;
            },
            update: async (args) => {
                const index = staffList.findIndex((s) => s.id === args.where.id);
                if (index !== -1) {
                    staffList[index] = { ...staffList[index], ...args.data, updatedAt: new Date() };
                    return staffList[index];
                }
                return null;
            },
            delete: async (args) => {
                const index = staffList.findIndex((s) => s.id === args.where.id);
                if (index !== -1) {
                    const deleted = staffList[index];
                    staffList.splice(index, 1);
                    return deleted;
                }
                return null;
            }
        };
        this.service = {
            findMany: async (args) => {
                if (!args || !args.where)
                    return servicesList;
                const { tenantId, isActive } = args.where;
                let result = servicesList.filter((s) => {
                    if (tenantId && s.tenantId !== tenantId)
                        return false;
                    if (isActive !== undefined && s.isActive !== isActive)
                        return false;
                    return true;
                });
                if (args.orderBy?.createdAt === 'asc')
                    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                return result;
            },
            findUnique: async (args) => {
                if (!args?.where?.id)
                    return null;
                return servicesList.find((s) => s.id === args.where.id) || null;
            },
            findFirst: async (args) => {
                if (!args?.where)
                    return servicesList[0] || null;
                const { id, tenantId } = args.where;
                return servicesList.find((s) => {
                    if (id && s.id !== id)
                        return false;
                    if (tenantId && s.tenantId !== tenantId)
                        return false;
                    return true;
                }) || null;
            },
            create: async (args) => {
                const newService = {
                    id: `service-${Math.random().toString(36).substr(2, 9)}`,
                    ...args.data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                servicesList.push(newService);
                return newService;
            },
            update: async (args) => {
                const index = servicesList.findIndex((s) => s.id === args.where.id);
                if (index !== -1) {
                    servicesList[index] = { ...servicesList[index], ...args.data, updatedAt: new Date() };
                    return servicesList[index];
                }
                return null;
            },
            delete: async (args) => {
                const index = servicesList.findIndex((s) => s.id === args.where.id);
                if (index !== -1) {
                    const deleted = servicesList[index];
                    servicesList.splice(index, 1);
                    return deleted;
                }
                return null;
            }
        };
        this.customer = {
            findMany: async (args) => {
                let result = [...customersList];
                if (args?.where) {
                    const { tenantId, requiresDeposit, phone } = args.where;
                    result = result.filter((c) => {
                        if (tenantId && c.tenantId !== tenantId)
                            return false;
                        if (requiresDeposit !== undefined && c.requiresDeposit !== requiresDeposit)
                            return false;
                        if (phone && c.phone !== phone)
                            return false;
                        return true;
                    });
                }
                if (args?.include?.appointments) {
                    result = result.map((c) => ({
                        ...c,
                        appointments: appointmentsList.filter((a) => {
                            if (a.customerId !== c.id)
                                return false;
                            if (args.include.appointments.where?.status && a.status !== args.include.appointments.where.status)
                                return false;
                            return true;
                        }).map((a) => ({
                            ...a,
                            ...(args.include.appointments.select ? Object.fromEntries(Object.keys(args.include.appointments.select).map((k) => [k, a[k]])) : {})
                        }))
                    }));
                }
                if (args?.orderBy?.name === 'asc')
                    result.sort((a, b) => a.name.localeCompare(b.name));
                if (args?.take)
                    result = result.slice(0, args.take);
                return result;
            },
            findFirst: async (args) => {
                if (!args?.where)
                    return customersList[0] || null;
                const { id, tenantId, phone } = args.where;
                return customersList.find((c) => {
                    if (id && c.id !== id)
                        return false;
                    if (tenantId && c.tenantId !== tenantId)
                        return false;
                    if (phone && c.phone !== phone)
                        return false;
                    return true;
                }) || null;
            },
            findUnique: async (args) => {
                if (!args?.where?.id)
                    return null;
                return customersList.find((c) => c.id === args.where.id) || null;
            },
            create: async (args) => {
                const newCustomer = {
                    id: `customer-${Math.random().toString(36).substr(2, 9)}`,
                    noShowCount: 0,
                    isBlacklisted: false,
                    requiresDeposit: true,
                    loyaltyStamps: 0,
                    lastAppointmentAt: null,
                    lastMarketingSentAt: null,
                    birthDate: null,
                    ...args.data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                customersList.push(newCustomer);
                return newCustomer;
            },
            update: async (args) => {
                const index = customersList.findIndex((c) => c.id === args.where.id);
                if (index !== -1) {
                    customersList[index] = { ...customersList[index], ...args.data, updatedAt: new Date() };
                    return customersList[index];
                }
                return null;
            },
            delete: async (args) => {
                const index = customersList.findIndex((c) => c.id === args.where.id);
                if (index !== -1) {
                    const deleted = customersList[index];
                    customersList.splice(index, 1);
                    return deleted;
                }
                return null;
            }
        };
        this.appointment = {
            findMany: async (args) => {
                let result = [...appointmentsList];
                if (args?.where) {
                    const { tenantId, staffId, dateTime, status } = args.where;
                    result = result.filter((a) => {
                        if (tenantId && a.tenantId !== tenantId)
                            return false;
                        if (staffId && a.staffId !== staffId)
                            return false;
                        if (dateTime?.gte && new Date(a.dateTime) < new Date(dateTime.gte))
                            return false;
                        if (dateTime?.lte && new Date(a.dateTime) > new Date(dateTime.lte))
                            return false;
                        if (status?.not && a.status === status.not)
                            return false;
                        if (status && typeof status === 'string' && a.status !== status)
                            return false;
                        return true;
                    });
                }
                if (args?.include) {
                    result = result.map((a) => ({
                        ...a,
                        customer: args.include.customer
                            ? customersList.find((c) => c.id === a.customerId) || null
                            : undefined,
                        service: args.include.service || args.include.service === true
                            ? servicesList.find((s) => s.id === a.serviceId) || null
                            : undefined,
                        staff: args.include.staff || args.include.staff === true
                            ? staffList.find((s) => s.id === a.staffId) || null
                            : undefined
                    }));
                }
                if (args?.orderBy?.dateTime === 'asc')
                    result.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
                return result;
            },
            findFirst: async (args) => {
                if (!args?.where)
                    return appointmentsList[0] || null;
                const { id, tenantId, staffId, dateTime, status } = args.where;
                const match = appointmentsList.find((a) => {
                    if (id && a.id !== id)
                        return false;
                    if (tenantId && a.tenantId !== tenantId)
                        return false;
                    if (staffId && a.staffId !== staffId)
                        return false;
                    if (dateTime?.gte && new Date(a.dateTime) < new Date(dateTime.gte))
                        return false;
                    if (dateTime?.lt && new Date(a.dateTime) >= new Date(dateTime.lt))
                        return false;
                    if (status?.notIn && status.notIn.includes(a.status))
                        return false;
                    return true;
                }) || null;
                if (match && args?.include?.staff) {
                    return { ...match, staff: staffList.find((s) => s.id === match.staffId) || null };
                }
                return match;
            },
            count: async (args) => {
                if (!args?.where)
                    return appointmentsList.length;
                const { tenantId, dateTime, status } = args.where;
                return appointmentsList.filter((a) => {
                    if (tenantId && a.tenantId !== tenantId)
                        return false;
                    if (dateTime?.gte && new Date(a.dateTime) < new Date(dateTime.gte))
                        return false;
                    if (dateTime?.lt && new Date(a.dateTime) >= new Date(dateTime.lt))
                        return false;
                    if (status?.notIn && status.notIn.includes(a.status))
                        return false;
                    return true;
                }).length;
            },
            create: async (args) => {
                const newApp = {
                    id: `app-${Math.random().toString(36).substr(2, 9)}`,
                    isPaid: false,
                    paymentMethod: null,
                    paidAmount: null,
                    staffCommissionEarned: null,
                    confirmationStatus: 'PENDING',
                    notes: null,
                    ...args.data,
                    dateTime: new Date(args.data.dateTime),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                appointmentsList.push(newApp);
                // include ilişkileri ekle
                const result = { ...newApp };
                if (args?.include?.service)
                    result.service = servicesList.find((s) => s.id === newApp.serviceId) || null;
                if (args?.include?.staff)
                    result.staff = staffList.find((s) => s.id === newApp.staffId) || null;
                return result;
            },
            update: async (args) => {
                const index = appointmentsList.findIndex((a) => a.id === args.where.id);
                if (index !== -1) {
                    appointmentsList[index] = { ...appointmentsList[index], ...args.data, updatedAt: new Date() };
                    return appointmentsList[index];
                }
                return null;
            }
        };
        this.payment = {
            create: async (args) => {
                return { id: `pay-${Math.random().toString(36).substr(2, 9)}`, ...args.data, createdAt: new Date() };
            },
            findMany: async (args) => []
        };
        this.media = {
            aggregate: async () => ({ _sum: { fileSize: 0 } })
        };
        this.landingPageConfig = {
            findFirst: async (args) => {
                if (args?.where?.isPublished) {
                    return landingConfigs.find(c => c.isPublished) || null;
                }
                return landingConfigs[0] || null;
            },
            create: async (args) => {
                const newConfig = {
                    id: args.data.id || `config-${Math.random().toString(36).substr(2, 9)}`,
                    heroTitle: args.data.heroTitle || null,
                    heroDescription: args.data.heroDescription || null,
                    ctaText: args.data.ctaText || null,
                    ctaLink: args.data.ctaLink || null,
                    logoLight: args.data.logoLight || null,
                    logoDark: args.data.logoDark || null,
                    favicon: args.data.favicon || null,
                    seoTitle: args.data.seoTitle || null,
                    seoDescription: args.data.seoDescription || null,
                    seoOgImage: args.data.seoOgImage || null,
                    activeSections: args.data.activeSections || {},
                    isPublished: args.data.isPublished !== undefined ? args.data.isPublished : false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                landingConfigs.push(newConfig);
                return newConfig;
            },
            update: async (args) => {
                const index = landingConfigs.findIndex(c => c.id === args.where.id);
                if (index !== -1) {
                    landingConfigs[index] = {
                        ...landingConfigs[index],
                        ...args.data,
                        updatedAt: new Date()
                    };
                    return landingConfigs[index];
                }
            }
        };
        this.marketingLog = {
            findMany: async (args) => {
                let result = [...marketingLogs];
                if (args?.where?.channel) {
                    result = result.filter(l => l.channel === args.where.channel);
                }
                if (args?.take) {
                    result = result.slice(0, args.take);
                }
                return result;
            },
            findFirst: async (args) => {
                return marketingLogs[0] || null;
            },
            create: async (args) => {
                const newLog = {
                    id: `mlog-${Math.random().toString(36).substr(2, 9)}`,
                    tenantId: args.data.tenantId,
                    channel: args.data.channel || 'WHATSAPP',
                    type: args.data.type || 'WEBHOOK',
                    recipient: args.data.recipient || 'UNKNOWN',
                    status: args.data.status || 'SENT',
                    sentAt: new Date()
                };
                marketingLogs.push(newLog);
                return newLog;
            }
        };
        this.$transaction = async (fn) => {
            if (typeof fn === 'function') {
                return await fn(this);
            }
            return fn;
        };
    }
}
exports.prisma = new MockPrisma();
function getTenantPrisma(tenantId) {
    return exports.prisma;
}
