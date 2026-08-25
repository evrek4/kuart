import { sendWhatsAppTemplateMessage, sendWhatsAppTextMessage } from '../services/whatsapp';

export async function addNotificationJob(data: any) {
  console.log("[MockQueue] Notification job added:", data);
  
  if (data.type === 'WHATSAPP' && data.recipient) {
    console.log(`[WhatsApp Dispatcher] Processing WA job for ${data.recipient}`);
    
    // As per the structure used in appointments.ts, we send a template message
    if (data.templateName) {
      // Convert standard variables to Meta Template Components
      // E.g., {{1}} = clientName, {{2}} = salonName, {{3}} = dateTime, {{4}} = serviceName
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.variables?.clientName || 'Müşterimiz' },
            { type: 'text', text: data.variables?.salonName || 'Salonumuz' },
            { type: 'text', text: data.variables?.dateTime || 'Randevu Saatiniz' },
            { type: 'text', text: data.variables?.serviceName || 'Hizmetiniz' },
          ]
        }
      ];
      
      // We process asynchronously without blocking
      sendWhatsAppTemplateMessage(data.recipient, data.templateName, 'tr', components).catch(err => {
        console.error('[WhatsApp Dispatcher] Failed to send WA template:', err.message);
      });
    }
  }
}
