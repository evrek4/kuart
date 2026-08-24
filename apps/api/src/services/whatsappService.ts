import { prisma } from '@kuafor-art/database';
import { sendPreferredNotification } from './notificationService';

export class WhatsappService {
  /**
   * Normalizes phone numbers to last 10 digits for matching.
   * e.g., "+905321234567" -> "5321234567"
   *       "0532 123 45 67" -> "5321234567"
   */
  static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.slice(-10);
  }

  /**
   * Send WhatsApp text message to customer.
   * Uses live Cloud API if WHATSAPP_API_KEY is configured, else runs in [DEV MOCK MODE].
   */
  static async sendMessage(to: string, message: string): Promise<{ success: boolean; mock: boolean; messageId?: string }> {
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiKey || !phoneId) {
      console.log(`💬 [DEV MOCK MODE] WhatsApp Message -> To: ${to} | Content: "${message}"`);
      return { success: true, mock: true, messageId: `mock-wa-msg-${Date.now()}` };
    }

    try {
      // Live Cloud API Call
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: this.normalizePhone(to),
          type: 'text',
          text: { body: message }
        })
      });

      const json = await response.json();
      if (response.ok) {
        return { success: true, mock: false, messageId: json.messages?.[0]?.id };
      } else {
        console.error('❌ [WhatsappService Live Error]:', json);
        return { success: false, mock: false };
      }
    } catch (error) {
      console.error('❌ [WhatsappService Exception]:', error);
      return { success: false, mock: false };
    }
  }

  /**
   * Send WhatsApp template message to customer.
   */
  static async sendTemplateMessage(
    to: string,
    templateName: string,
    components: any[] = []
  ): Promise<{ success: boolean; mock: boolean }> {
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiKey || !phoneId) {
      console.log(`💬 [DEV MOCK MODE] WhatsApp Template "${templateName}" -> To: ${to}`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: this.normalizePhone(to),
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'tr' },
            components
          }
        })
      });

      const json = await response.json();
      return { success: response.ok, mock: false };
    } catch (error) {
      console.error('❌ [WhatsappService Template Exception]:', error);
      return { success: false, mock: false };
    }
  }

  /**
   * Processes a WhatsApp message response from a customer.
   * @param fromPhone Customer's phone number
   * @param messageText Customer's message content (1, 2, Geleceğim, İptal, vb.)
   */
  static async handleIncomingMessage(fromPhone: string, messageText: string): Promise<boolean> {
    const normalizedMessage = messageText.trim().toLowerCase();
    const normalizedPhone = this.normalizePhone(fromPhone);

    if (!normalizedPhone) {
      console.warn('[WhatsappService] Empty phone received');
      return false;
    }

    // 1. Onay veya İptal intent'lerini belirle
    const isApprove = ['1', 'geleceğim', 'onaylıyorum', 'onay', 'yes', 'evet'].includes(normalizedMessage);
    const isCancel = ['2', 'gelmeyeceğim', 'iptal', 'iptal et', 'hayır', 'no'].includes(normalizedMessage);

    if (!isApprove && !isCancel) {
      console.log(`[WhatsappService] Message "${messageText}" from ${fromPhone} did not match confirmation intents.`);
      return false;
    }

    // 2. Müşteriyi telefon numarasına göre bul (son 10 hane)
    const customers = await prisma.customer.findMany({
      where: {
        phone: {
          endsWith: normalizedPhone
        }
      }
    });

    if (customers.length === 0) {
      console.warn(`[WhatsappService] No customer found for phone suffix: ${normalizedPhone}`);
      return false;
    }

    const customerIds = customers.map((c: any) => c.id);

    // 3. Bu müşterilere ait, teyit bekleyen (PENDING) ve en yakın randevuyu bul
    const appointment = await prisma.appointment.findFirst({
      where: {
        customerId: {
          in: customerIds
        },
        confirmationStatus: 'PENDING',
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      },
      orderBy: {
        dateTime: 'asc'
      },
      include: {
        customer: true,
        tenant: true
      }
    });

    if (!appointment) {
      console.warn(`[WhatsappService] No PENDING appointment found for customer suffix: ${normalizedPhone}`);
      return false;
    }

    const tenantId = appointment.tenantId;

    if (isApprove) {
      // Randevuyu teyit et
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          confirmationStatus: 'CONFIRMED'
        }
      });
      console.log(`[WhatsappService] Appointment ${appointment.id} CONFIRMED by customer ${appointment.customer.name}`);
      return true;
    } else if (isCancel) {
      // Randevuyu iptal et
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          confirmationStatus: 'CANCELLED_BY_CUSTOMER',
          status: 'CANCELLED'
        }
      });

      console.log(`[WhatsappService] Appointment ${appointment.id} CANCELLED_BY_CUSTOMER by customer ${appointment.customer.name}`);

      // Kuaföre bildirim gönder
      const appointmentDate = new Date(appointment.dateTime);
      const formattedDate = appointmentDate.toLocaleDateString('tr-TR');
      const formattedTime = appointmentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      const notifyMessage = `⚠️ Randevu İptal Edildi: ${appointment.customer.name}, ${formattedDate} ${formattedTime} randevusunu gelemeyeceğini belirterek iptal etti. Takviminizdeki bu slot boşa çıkarılmıştır.`;
      
      await sendPreferredNotification(tenantId, notifyMessage);
      return true;
    }

    return false;
  }
}
