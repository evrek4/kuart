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
    if (!info || !info.tenantId) {
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
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-neutral-900 dark:text-[#F5F5F5] font-sans flex flex-col md:flex-row relative transition-colors duration-200 ease-in-out">
      {/* Glow effect backgrounds */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />

      {/* MASAÜSTÜ SIDEBAR (md ve üzeri ekranlarda görünür) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-[#121212] border-r border-neutral-200 dark:border-white/5 h-screen sticky top-0 p-6 z-40 transition-colors duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo / Salon Adı — JWT'den dinamik olarak okunur */}
          {/* Logo / Salon Adı — JWT'den dinamik olarak okunur */}
          <div className="border-b border-neutral-200 dark:border-white/5 pb-4">
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase">
              {tenantName}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border uppercase block w-fit mt-1 ${
              planName === 'ELITE' 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-500 dark:text-purple-400' 
                : planName === 'PRO'
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-neutral-500/10 border-neutral-500/20 text-neutral-500 dark:text-neutral-400'
            }`}>
              {planName} YÖNETİM
            </span>

            {/* Vitrini Görüntüle Butonu (Sidebar) */}
            <a
              href={tenantSlug ? `/${tenantSlug}` : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-4 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
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
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-colors text-sm font-semibold ${
                      isActive
                        ? "bg-primary/15 border border-primary/20 text-primary shadow-sm dark:shadow-gold-glow"
                        : "text-neutral-600 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Alt Bilgi + Tema Değiştirici + Çıkış Butonu */}
        <div className="flex flex-col gap-3">
          {tenantSlug && (
            <div className="text-[9px] text-neutral-500 dark:text-gray-400 font-medium truncate">
              🌐 {tenantSlug}.kuafor.art
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                document.cookie = "kuafor-token=; path=/; max-age=0; SameSite=Lax";
                router.replace("/login");
              }}
              className="text-xs text-neutral-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-semibold text-left"
            >
              ⬅ Çıkış Yap
            </button>
            <ThemeToggle />
          </div>
          <div className="border-t border-neutral-200 dark:border-white/5 pt-3 text-center text-[10px] text-neutral-400 dark:text-gray-500 font-medium">
            Kuafor.art Core v1.2
          </div>
        </div>
      </aside>

      {/* MOBİL VE TABLET LAYOUT İÇİN TOP NAVBAR */}
      <header className="md:hidden w-full px-6 py-4 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-white/5 flex justify-between items-center sticky top-0 z-30 transition-colors duration-200">
        <div>
          {/* Salon adı JWT'den dinamik — hardcoded değil */}
          <h1 className="text-md font-extrabold text-neutral-900 dark:text-white tracking-tight uppercase">
            {tenantName}
          </h1>
          <span className={`text-[8px] font-black tracking-widest uppercase block mt-0.5 ${
            planName === 'ELITE'
              ? 'text-purple-500 dark:text-purple-400'
              : planName === 'PRO'
              ? 'text-primary'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}>{planName}</span>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-neutral-200 dark:border-white/5 flex justify-around items-center px-2 z-40 transition-colors duration-200">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center flex-1 py-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-primary font-bold" : "text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px] font-extrabold tracking-wide uppercase">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
