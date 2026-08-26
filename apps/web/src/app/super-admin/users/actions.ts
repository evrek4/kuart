"use server";

import { prisma } from '@kuafor-art/database';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET!;

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

export async function getUsers() {
  const tokenUser = getUserFromToken();
  if (!tokenUser || tokenUser.role !== "SUPER_ADMIN") {
    return { success: false, error: "Yetkisiz erişim" };
  }

  // Sadece tüm kullanıcıları listeleyeceğiz, tenant bilgilerine gerek duymadan Mock üzerinden.
  // Gerçek projede select ile belirli alanlar alınır
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  });
  
  const formatted = allUsers.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt
  }));

  return { success: true, data: formatted };
}

export async function createUserAction(formData: FormData) {
  const tokenUser = getUserFromToken();
  if (!tokenUser || tokenUser.role !== "SUPER_ADMIN") {
    return { success: false, error: "Yetkisiz erişim" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !role || !password) {
    return { success: false, error: "Tüm alanlar zorunludur." };
  }

  const ALLOWED_ROLES = ['SUB_ADMIN', 'MARKETING', 'TENANT'];
  if (!ALLOWED_ROLES.includes(role)) {
    return { success: false, error: "Geçersiz veya yetkisiz rol." };
  }

  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return { success: false, error: "Bu e-posta adresi zaten kullanımda." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: true
      }
    });

    return { success: true, message: "Kullanıcı başarıyla oluşturuldu." };
  } catch (error) {
    return { success: false, error: "Kullanıcı oluşturulamadı." };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const tokenUser = getUserFromToken();
  if (!tokenUser || tokenUser.role !== "SUPER_ADMIN") {
    return { success: false, error: "Yetkisiz erişim" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus }
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: "Güncelleme başarısız." };
  }
}
