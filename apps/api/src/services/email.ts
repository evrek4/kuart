import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'localhost';
const port = parseInt(process.env.SMTP_PORT || '1025', 10);
const fromEmail = process.env.SMTP_FROM || 'noreply@kuafor.test';

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false, // false for 1025/587
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Sends an email using SMTP settings.
 * @param to Recipient email address
 * @param subject Subject of the email
 * @param html HTML body content of the email
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"Kuafor.art" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] Email sent to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending email:', error);
    return false;
  }
}
