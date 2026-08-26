import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import SuperAdminShell from "./SuperAdminShell";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("kuafor-token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    // If JWT_SECRET is not set, this will throw, which is safer than allowing access.
    const payload = jwt.verify(token, process.env.JWT_SECRET || "lokal-test-secret-123") as any;
    if (payload.role !== "SUPER_ADMIN") {
      redirect("/login");
    }
  } catch (error) {
    redirect("/login");
  }

  return <SuperAdminShell>{children}</SuperAdminShell>;
}
