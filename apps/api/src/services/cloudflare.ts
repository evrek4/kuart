import dotenv from 'dotenv';
import { prisma } from '@kuafor-art/database';

dotenv.config();

/**
 * Cloudflare API Servisi
 * Elite paket ve özel alan adı eklentisi (Add-on) satın alan kiracıların
 * DNS ve Email Routing ayarlarını Cloudflare API üzerinden yönetir.
 */
export class CloudflareService {
  private static apiToken = process.env.CLOUDFLARE_API_TOKEN;
  private static accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  private static zoneId = process.env.CLOUDFLARE_ZONE_ID; // Kuafor.art ana zone ID'si

  private static getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Elite paket kullanan kiracılar için sisteme yeni bir Custom Hostname (Domain) ekler.
   * Cloudflare SSL sertifikası (SSL/TLS Encryption) otomatik olarak DV formatında kurulur.
   */
  static async addCustomDomain(tenantId: string, domain: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
    console.log(`[CloudflareService] Adding custom domain ${domain} for tenant ${tenantId}...`);

    if (!this.apiToken || !this.zoneId) {
      console.warn('[CloudflareService] Cloudflare credentials missing. Simulating domain addition.');
      return {
        success: true,
        data: {
          id: 'mock-hostname-id-' + Math.random().toString(36).substring(7),
          hostname: domain,
          status: 'pending_validation',
          ssl: { status: 'initializing', method: 'http' }
        }
      };
    }

    try {
      // Cloudflare Custom Hostname API Endpoint'ine istek at
      // POST /zones/:zone_id/custom_hostnames
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.zoneId}/custom_hostnames`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          hostname: domain,
          ssl: {
            method: 'http', // DV SSL HTTP doğrulaması
            type: 'dv',     // Domain Validation
            settings: {
              min_tls_version: '1.2',
              http2: 'on'
            }
          }
        }),
      });

      const json = (await response.json()) as { success: boolean; result?: unknown; errors?: Array<{ message: string }> };

      if (!response.ok || !json.success) {
        throw new Error(json.errors?.[0]?.message || 'Cloudflare API error');
      }

      // Veritabanında tenant custom domain kaydını güncelle
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { customDomain: domain }
      });

      return {
        success: true,
        data: json.result
      };

    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Domain addition failed';
      console.error('[CloudflareService] AddCustomDomain Error:', errMessage);
      return {
        success: false,
        error: errMessage
      };
    }
  }

  /**
   * Kiracının kendi özel alan adına gelen e-postaları (iletisim@salonadi.com)
   * şahsi yönlendirme e-posta adresine (salon@gmail.com) yönlendiren Cloudflare Email Routing kuralını yazar.
   */
  static async setupEmailRouting(
    tenantId: string, 
    domain: string, 
    forwardTo: string
  ): Promise<{ success: boolean; ruleId?: string; error?: string }> {
    console.log(`[CloudflareService] Setting up email routing from *@${domain} to ${forwardTo}...`);

    if (!this.apiToken || !this.accountId) {
      console.warn('[CloudflareService] Cloudflare Account credentials missing. Simulating email routing.');
      return {
        success: true,
        ruleId: 'mock-rule-id-' + Math.random().toString(36).substring(7)
      };
    }

    try {
      // Cloudflare Email Routing API Endpoint'ine istek at
      // POST /accounts/:account_id/email/routing/rules
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/email/routing/rules`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: `Forward ${domain} emails to ${forwardTo}`,
          enabled: true,
          matchers: [
            {
              type: 'literal',
              field: 'to',
              value: `iletisim@${domain}` // Sadece iletisim@ alan adını yönlendir
            }
          ],
          actions: [
            {
              type: 'forward',
              value: [forwardTo]
            }
          ]
        }),
      });

      const json = (await response.json()) as { success: boolean; result?: { id: string }; errors?: Array<{ message: string }> };

      if (!response.ok || !json.success) {
        throw new Error(json.errors?.[0]?.message || 'Cloudflare Email Routing error');
      }

      return {
        success: true,
        ruleId: json.result?.id
      };

    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Email routing setup failed';
      console.error('[CloudflareService] EmailRouting Error:', errMessage);
      return {
        success: false,
        error: errMessage
      };
    }
  }
}
