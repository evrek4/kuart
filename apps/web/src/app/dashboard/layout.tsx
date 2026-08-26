"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCurrentTenantInfo } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [tenantName, setTenantName] = useState<string>("Yükleniyor...");
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>("FREE");

  useEffect(() => {
    const info = getCurrentTenantInfo();

    // Token yoksa veya tenant bilgisi yoksa login'e yönlendir
    if (!info) {
      router.replace("/login?callbackUrl=/dashboard");
      return;
    }

    if (info.role === "SUPER_ADMIN") {
      router.replace("/super-admin");
      return;
    }

    if (!info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard");
      return;
    }

    // Mevcut bilgileri state'e yaz (API çağrısına gerek yok — token zaten güvenli)
    setTenantSlug(info.tenantSlug);

    // Salon adını API'den al (slug kullanarak)
    async function fetchTenantName() {
      if (!info?.tenantSlug) {
        setTenantName("Salonum");
        return;
      }
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(
          `${apiBase}/api/storefront/${info.tenantSlug}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.data?.tenant?.name) {
              setTenantName(json.data.tenant.name.toUpperCase());
            }
            if (json.data?.tenant?.plan) {
              setPlanName(json.data.tenant.plan.toUpperCase());
            }
          } else {
            setTenantName("Salonum");
          }
        } else {
          setTenantName("Salonum");
        }
      } catch {
        setTenantName("Salonum");
      }
    }

    fetchTenantName();
  }, [router]);

  const menuItems = [
    { href: "/dashboard", label: "Özet", icon: "📊" },
    { href: "/dashboard/calendar", label: "Takvim", icon: "📅" },
    { href: "/dashboard/services", label: "Hizmetlerim", icon: "✂️" },
    { href: "/dashboard/staff", label: "Personellerim", icon: "💈" },
    { href: "/dashboard/customers", label: "Müşteriler", icon: "👥" },
    { href: "/dashboard/gallery", label: "Galeri", icon: "🖼️" },
    { href: "/dashboard/billing", label: "Paketim & Faturalandırma", icon: "💳" },
    { href: "/dashboard/finance", label: "Kasa & Prim Raporu", icon: "💰" },
    { href: "/dashboard/marketing", label: "Pazarlama & Otomasyon", icon: "📣" },
    { href: "/dashboard/settings", label: "Ayarlar", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#081326] text-lightText-primary dark:text-darkText-primary font-sans flex flex-col md:flex-row relative transition-colors duration-200 ease-in-out">
      {/* MASAÜSTÜ SIDEBAR (md ve üzeri ekranlarda görünür) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-[#081326] border-r border-borderlight dark:border-dark-border h-screen sticky top-0 p-6 z-40 transition-colors duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo / Salon Adı — JWT'den dinamik olarak okunur */}
          {/* Logo / Salon Adı — JWT'den dinamik olarak okunur */}
          <div className="border-b border-borderlight dark:border-dark-border pb-4">
            <h1 className="text-xl font-extrabold tracking-tight text-[#0B1933] dark:text-[#F7F8FA] uppercase">
              {tenantName}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border border-gray-300 dark:border-gray-600 uppercase block w-fit mt-1 text-lightText-secondary dark:text-darkText-secondary">
              {planName} YÖNETİM
            </span>

            {/* Vitrini Görüntüle Butonu (Sidebar) */}
            <a
              href={tenantSlug ? `/${tenantSlug}` : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-4 text-sm font-medium border border-[#0B1933] dark:border-white rounded-lg bg-transparent text-[#0B1933] dark:text-[#F7F8FA] transition-opacity hover:opacity-70 shadow-sm"
            >
              <span>🌐</span>
              <span>VİTRİNİ GÖRÜNTÜLE</span>
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Menü Linkleri */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="w-full">
                  <div
                    className={`px-4 py-3 rounded-r-lg flex items-center gap-3 transition-colors text-sm font-semibold ${
                      isActive
                        ? "bg-gray-100 dark:bg-[#0D1B32] border-l-4 border-[#0B1933] dark:border-white text-[#0B1933] dark:text-[#F7F8FA]"
                        : "text-lightText-secondary dark:text-darkText-secondary hover:bg-gray-50 dark:hover:bg-[#0A111E] hover:text-lightText-primary dark:hover:text-darkText-primary border-l-4 border-transparent"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Alt Bilgi + Tema Değiştirici + Çıkış Butonu */}
        <div className="flex flex-col gap-3">
          {tenantSlug && (
            <div className="text-[9px] text-lightText-secondary dark:text-darkText-secondary font-medium truncate">
              🌐 {tenantSlug}.kuafor.art
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                document.cookie = "kuafor-token=; path=/; max-age=0; SameSite=Lax";
                router.replace("/login");
              }}
              className="text-xs text-lightText-secondary dark:text-darkText-secondary hover:opacity-70 transition-opacity font-semibold text-left"
            >
              ⬅ Çıkış Yap
            </button>
            <ThemeToggle />
          </div>
          <div className="border-t border-borderlight dark:border-dark-border pt-3 text-center text-[10px] text-lightText-secondary dark:text-darkText-secondary font-medium">
            Kuafor.art Core v1.2
          </div>
        </div>
      </aside>

      {/* MOBİL VE TABLET LAYOUT İÇİN TOP NAVBAR */}
      <header className="md:hidden w-full px-6 py-4 bg-white dark:bg-[#081326] border-b border-borderlight dark:border-dark-border flex justify-between items-center sticky top-0 z-30 transition-colors duration-200">
        <div>
          {/* Salon adı JWT'den dinamik — hardcoded değil */}
          <h1 className="text-md font-extrabold text-[#0B1933] dark:text-[#F7F8FA] tracking-tight uppercase">
            {tenantName}
          </h1>
          <span className="text-[8px] font-black tracking-widest uppercase block mt-0.5 text-lightText-secondary dark:text-darkText-secondary">
            {planName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={tenantSlug ? `/${tenantSlug}` : "/"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <span>🌐</span>
            <span className="hidden sm:inline">VİTRİN</span>
            <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <ThemeToggle />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-neutral-500 dark:text-gray-400 font-bold uppercase tracking-wider">AKTİF</span>
          </div>
        </div>
      </header>

      {/* DİNAMİK İÇERİK BÖLGESİ */}
      <main className="flex-1 min-w-0 pb-24 md:pb-8">
        {children}
      </main>

      {/* MOBİL BOTTOM NAVIGATION BAR (Sadece mobilde ekranın altında sabit kalır) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#081326] border-t border-borderlight dark:border-dark-border flex justify-around items-center px-2 z-40 transition-colors duration-200">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center flex-1 py-1">
                <div
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? "text-[#0B1933] dark:text-[#F7F8FA] font-bold" : "text-lightText-secondary dark:text-darkText-secondary"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[9px] font-extrabold tracking-wide uppercase">{item.label}</span>
                </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
