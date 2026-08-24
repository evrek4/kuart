export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string | null;
  customDomain?: string | null;
  plan?: string;
  allowPortalThemes?: boolean;
}

export interface TenantSettings {
  id?: string;
  tenantId?: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  aboutText?: string | null;
  coverImage?: string | null;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  whatsappEnabled?: boolean;
  preferredNotificationChannel?: string;
  noShowLimit?: number;
  requiredDepositAmount?: number;
  globalPaymentPolicy?: string;
  themeTemplate?: string;
  storefrontMode?: string;
  selectedThemeId?: string;
}

export interface StorefrontThemeProps {
  tenant: Tenant;
  settings: TenantSettings | null;
  services: Service[];
  staff: Staff[];
}
