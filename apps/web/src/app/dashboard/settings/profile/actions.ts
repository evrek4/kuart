"use server";

import { prisma } from '@kuafor-art/database';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lokal-test-secret-123";

function getUserFromToken() {
  const cookieStore = cookies();
  const token = cookieStore.get("kuafor-token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function getProfile() {
  const tokenUser = getUserFromToken();
  if (!tokenUser) return { success: false, error: "Yetkisiz erişim" };

  const user = await prisma.user.findUnique({ where: { id: tokenUser.userId } });
  if (!user) return { success: false, error: "Kullanıcı bulunamadı" };

  return { success: true, data: { name: user.name, phone: user.phone, address: user.address, email: user.email } };
}

export async function updateProfile(formData: FormData) {
  const tokenUser = getUserFromToken();
  if (!tokenUser) return { success: false, error: "Yetkisiz erişim" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  if (!name) return { success: false, error: "İsim alanı zorunludur." };

  try {
    await prisma.user.update({
      where: { id: tokenUser.userId },
      data: { name, phone, address }
    });
    return { success: true, message: "Profil bilgileriniz güncellendi." };
  } catch (error) {
    return { success: false, error: "Güncelleme başarısız." };
  }
}
