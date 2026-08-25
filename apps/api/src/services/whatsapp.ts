const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION || 'v20.0';

/**
 * Sends a generic text message using WhatsApp Cloud API.
 * @param to Phone number of the recipient with country code (e.g. 905321234567)
 * @param text The message content
 */
export async function sendWhatsAppTextMessage(to: string, text: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('WhatsApp API credentials are not set. Skipping message:', text);
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('Error sending WhatsApp message:', data);
      return false;
    }
    console.log('WhatsApp message sent successfully:', data);
    return true;
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error?.message || error);
    return false;
  }
}

/**
 * Sends a template message using WhatsApp Cloud API.
 * @param to Phone number of the recipient with country code
 * @param templateName The name of the approved template in Meta Manager
 * @param languageCode The language code of the template (e.g. 'tr')
 * @param components Optional parameters to map to template placeholders
 */
export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'tr',
  components: any[] = []
) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn(`WhatsApp API credentials missing. Skipping template ${templateName} to ${to}`);
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error(`Error sending WhatsApp template ${templateName}:`, data);
      return false;
    }
    console.log(`WhatsApp template ${templateName} sent successfully:`, data);
    return true;
  } catch (error: any) {
    console.error(`Error sending WhatsApp template ${templateName}:`, error?.message || error);
    return false;
  }
}
