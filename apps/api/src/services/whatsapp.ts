import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

let whatsappClient: Client | null = null;
let isWhatsAppReady = false;

// WhatsApp Client'ı Başlat (App.ts veya worker içinde çağırılacak)
export function initializeWhatsAppClient() {
  console.log('[WhatsApp] İstemci başlatılıyor...');

  whatsappClient = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('[WhatsApp] Lütfen aşağıdaki QR kodunu WhatsApp ile okutun:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    isWhatsAppReady = true;
    console.log('[WhatsApp] İstemci başarıyla bağlandı ve hazır!');
  });

  whatsappClient.on('authenticated', () => {
    console.log('[WhatsApp] Kimlik doğrulama başarılı.');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('[WhatsApp] Kimlik doğrulama hatası:', msg);
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('[WhatsApp] İstemci bağlantısı koptu:', reason);
    isWhatsAppReady = false;
  });

  whatsappClient.initialize().catch(err => {
    console.error('[WhatsApp] Başlatma hatası:', err);
  });
}

/**
 * Numara formatını whatsapp-web.js'e uygun hale getirir.
 * @param phone Telefon numarası (Örn: 905321234567 veya +905321234567)
 */
function formatPhoneNumber(phone: string) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = `90${cleaned.substring(1)}`;
  } else if (!cleaned.startsWith('90') && cleaned.length === 10) {
    cleaned = `90${cleaned}`;
  }
  return `${cleaned}@c.us`;
}

/**
 * Sends a generic text message using local WhatsApp client.
 * @param to Phone number of the recipient with country code
 * @param text The message content
 */
export async function sendWhatsAppTextMessage(to: string, text: string) {
  if (!whatsappClient || !isWhatsAppReady) {
    console.warn('[WhatsApp] İstemci hazır değil. Mesaj loglara yazıldı:', { to, text });
    return false;
  }

  try {
    const formattedNumber = formatPhoneNumber(to);
    await whatsappClient.sendMessage(formattedNumber, text);
    console.log(`[WhatsApp] Mesaj gönderildi -> ${to}`);
    return true;
  } catch (error: any) {
    console.error(`[WhatsApp] Mesaj gönderilemedi -> ${to}:`, error?.message || error);
    return false;
  }
}

/**
 * Sends a template message (Converted to standard text for local client).
 * @param to Phone number of the recipient with country code
 * @param templateName The name of the approved template (mapped to local text)
 * @param languageCode The language code
 * @param components Parameters to map to template placeholders
 */
export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'tr',
  components: any[] = []
) {
  if (!whatsappClient || !isWhatsAppReady) {
    console.warn(`[WhatsApp] İstemci hazır değil. Template mesajı atlandı: ${templateName} -> ${to}`);
    return false;
  }

  // Gelen 'components' formatı: [{ type: 'body', parameters: [ { type: 'text', text: 'Ahmet' }, ... ] }]
  const bodyParams = components.find((c: any) => c.type === 'body')?.parameters || [];
  const params = bodyParams.map((p: any) => p.text);

  let messageText = '';

  // Basit bir template -> string eşleştirmesi
  switch (templateName) {
    case 'appointment_created_wa':
      messageText = `Merhaba ${params[0] || 'Müşterimiz'},\n\n${params[1] || 'Salonumuz'} salonunda ${params[2] || 'bir tarih'} için ${params[3] || 'hizmet'} randevunuz başarıyla oluşturulmuştur.\n\nBizi tercih ettiğiniz için teşekkür ederiz.`;
      break;
    default:
      messageText = `Merhaba, işleminiz (Şablon: ${templateName}) başarıyla alınmıştır.\nDetaylar: ${params.join(', ')}`;
      break;
  }

  try {
    const formattedNumber = formatPhoneNumber(to);
    await whatsappClient.sendMessage(formattedNumber, messageText);
    console.log(`[WhatsApp] Template (${templateName}) mesaj olarak gönderildi -> ${to}`);
    return true;
  } catch (error: any) {
    console.error(`[WhatsApp] Template (${templateName}) gönderilemedi -> ${to}:`, error?.message || error);
    return false;
  }
}
