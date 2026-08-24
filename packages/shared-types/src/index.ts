/**
 * Kuafor.art Ortak Tip ve Arayüz Tanımları
 */

// Standart API Yanıt Formatı
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// POS Ayarları ve API Anahtarları Veri Yapısı
export interface PosConfig {
  customPaymentGateway: boolean;
  posProviderName: 'iyzico' | 'paytr' | string;
  gatewayApiKey?: string | null;
  gatewaySecretKey?: string | null;
}

// Asenkron Bildirim Kuyruğu (BullMQ) Veri Yapısı
export interface NotificationPayload {
  tenantId: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  recipient: string; // Email adresi veya telefon numarası
  templateName: string;
  variables: Record<string, string>;
}

// Randevu Talebi Veri Yapısı
export interface CreateAppointmentRequest {
  serviceId?: string;
  serviceIds?: string[];
  staffId: string;
  dateTime: string; // ISO format
  customerName: string;
  customerPhone: string; // Formatlı TR tel no
  customerEmail?: string;
  notes?: string;
}

// No-Show ve Kara Liste Durumu Yanıt Yapısı
export interface BlacklistStatusResponse {
  isBlocked: boolean; // Tamamen engellendi mi (örneğin aşırı no-show)
  requiresDeposit: boolean; // Kapora ödemesi yapması gerekiyor mu
  noShowCount: number;
  depositAmount: number;
}

// Cloudflare Custom Domain Eklenti Durumu
export interface CloudflareDomainConfig {
  domain: string;
  status: 'PENDING' | 'ACTIVE' | 'ERROR';
  dnsRecords: {
    type: 'CNAME';
    name: string;
    value: string;
    proxied: boolean;
  }[];
}
