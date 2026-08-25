"use server";

import { prisma } from '@kuafor-art/database';
import bcrypt from 'bcrypt';

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { success: false, error: "E-posta gerekli" };

  // 1. Kullanıcıyı bul
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    // Güvenlik gereği, kullanıcı olmasa bile "Email gönderildi" deriz
    return { success: true, message: "Eğer kayıtlı bir kullanıcı varsa, şifre sıfırlama e-postası gönderilmiştir." };
  }

  // 2. Token oluştur
  const token = Math.random().toString(36).substr(2, 20);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli

  // 3. Token'ı kaydet
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt
    }
  });

  // 4. Mock Email/SMS Gönderimi
  console.log(`[Email Mock] ${email} adresine şifre sıfırlama linki gönderildi: http://localhost:3000/reset-password?token=${token}`);

  return { success: true, message: "Şifre sıfırlama linki e-posta adresinize gönderildi." };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) return { success: false, error: "Token ve yeni şifre gereklidir." };

  // 1. Token'ı bul
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken) {
    return { success: false, error: "Geçersiz veya süresi dolmuş token." };
  }

  // 2. Süresini kontrol et
  if (resetToken.expiresAt < new Date()) {
    return { success: false, error: "Token süresi dolmuş." };
  }

  // 3. Şifreyi hashle
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. Kullanıcıyı güncelle
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash }
  });

  // 5. Token'ı sil
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

  return { success: true, message: "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz." };
}
