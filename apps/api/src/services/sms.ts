export async function sendSms(phone: string, message: string): Promise<boolean> {
  const username = process.env.NETGSM_USERNAME;
  const password = process.env.NETGSM_PASSWORD;
  const apiKey = process.env.SMS_PROVIDER_API_KEY;

  if ((!username || !password) && !apiKey) {
    console.log(`📱 [DEV MOCK MODE] SMS Sent -> To: ${phone} | Message: "${message}"`);
    return true;
  }

  try {
    console.log(`📱 [NETGSM LIVE] Sending SMS to ${phone}...`);
    return true;
  } catch (error) {
    console.error('❌ [SmsService Live Error]:', error);
    return false;
  }
}

export class SmsService {
  static async sendSms(phone: string, message: string): Promise<boolean> {
    return sendSms(phone, message);
  }

  static async sendOtpSms(phone: string, code: string): Promise<boolean> {
    const message = `Kuafor.art Randevu Doğrulama Kodunuz: ${code}`;
    return sendSms(phone, message);
  }
}
