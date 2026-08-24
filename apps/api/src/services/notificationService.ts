import { prisma } from '@kuafor-art/database';
import { sendSms } from './sms';

export async function sendPreferredNotification(tenantId: string, message: string): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        settings: true,
        users: {
          where: { role: 'SALON_OWNER', isActive: true },
          take: 1
        }
      }
    });

    if (!tenant) {
      console.warn(`[NotificationService] Tenant not found for notification: ${tenantId}`);
      return false;
    }

    const preferredChannel = tenant.settings?.preferredNotificationChannel || 'WHATSAPP';
    const owner = tenant.users[0];
    const recipientPhone = owner?.phone || '05320000000';
    const recipientEmail = owner?.email || 'salon@kuafor.art';

    console.log(`[NotificationService] Dispatching alert to ${tenant.name} via ${preferredChannel}`);

    if (preferredChannel === 'WHATSAPP') {
      console.log(`[WhatsAppService] [SIMULATOR] WhatsApp message sent to ${recipientPhone}`);
      console.log(`[WhatsAppService] [SIMULATOR] Text: "${message}"`);
      return true;
    } else if (preferredChannel === 'SMS') {
      return await sendSms(recipientPhone, message);
    } else if (preferredChannel === 'EMAIL') {
      console.log(`[EmailService] [SIMULATOR] Email sent to ${recipientEmail}`);
      console.log(`[EmailService] [SIMULATOR] Subject: Kuafor.art Bildirimi`);
      console.log(`[EmailService] [SIMULATOR] Body: "${message}"`);
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('[NotificationService] Failed to send preferred notification:', error);
    return false;
  }
}
