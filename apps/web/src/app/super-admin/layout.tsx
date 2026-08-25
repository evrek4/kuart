"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
}

function SidebarItem({ href, label, icon, isActive }: SidebarItemProps) {
  return (
    <Link href={href} className="w-full">
      <div
        className={`px-6 py-3 rounded-r-lg flex items-center gap-3 transition-colors text-sm font-semibold tracking-wide ${
          isActive
            ? "bg-gray-100 dark:bg-[#0D1B32] border-l-4 border-[#0B1933] dark:border-white text-[#0B1933] dark:text-[#F7F8FA]"
            : "text-lightText-secondary dark:text-darkText-secondary hover:bg-gray-50 dark:hover:bg-[#0A111E] hover:text-lightText-primary dark:hover:text-darkText-primary border-l-4 border-transparent"
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { href: "/super-admin", label: "Platform Kokpiti", icon: "📊" },
    { href: "/super-admin/landing-cms", label: "Marka & CMS", icon: "🎨" },
    { href: "/super-admin/tenants", label: "Mağaza Yönetimi", icon: "🏬" },
    { href: "/super-admin/packages", label: "Abonelik Paketleri", icon: "💎" },
    { href: "/super-admin/coupons", label: "İndirim Kuponları", icon: "🎟️" },
    { href: "/super-admin/settings", label: "Sistem Altyapısı", icon: "⚙️" },
  ];

  const handleLogout = () => {
    // Delete user-role cookie
    document.cookie = "user-role=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#081326] text-lightText-primary dark:text-darkText-primary font-sans flex overflow-hidden relative transition-colors duration-200 ease-in-out">

      {/* Super Admin Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex flex-col justify-between border-r border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] h-screen sticky top-0 p-6 z-40 transition-colors duration-200"
          >
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-borderlight dark:border-dark-border pb-6">
                <div>
                  <h1 className="text-xl font-black tracking-tighter text-[#0B1933] dark:text-[#F7F8FA] uppercase">
                    Kuafor.art
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest border border-gray-300 dark:border-gray-600 text-lightText-secondary dark:text-darkText-secondary uppercase shadow-none block w-fit mt-1">
                    SÜPER ADMİN
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href}
                  />
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-borderlight dark:border-dark-border pt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-lightText-secondary dark:text-darkText-secondary font-semibold">Görünüm</span>
                <ThemeToggle />
              </div>
              <Link href="/">
                <button
                  className="w-full py-3 rounded-lg border border-borderlight dark:border-dark-border hover:bg-gray-50 dark:hover:bg-[#0A111E] text-xs font-bold text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary bg-white dark:bg-[#081326] transition-colors"
                >
                  ← Platforma Dön
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="px-6 py-4 border-b border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] sticky top-0 z-30 flex justify-between items-center transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E] hover:bg-gray-100 dark:hover:bg-dark-highlight text-sm hidden md:block text-lightText-primary dark:text-darkText-primary transition-colors"
            >
              ☰
            </button>
            <h2 className="font-extrabold text-base tracking-wide uppercase text-[#0B1933] dark:text-[#F7F8FA]">
              {menuItems.find((item) => item.href === pathname)?.label || "Süper Admin Yönetim Paneli"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <div className="text-right">
              <div className="text-xs font-bold text-lightText-primary dark:text-darkText-primary">Platform Owner</div>
              <div className="text-[10px] text-lightText-secondary dark:text-darkText-secondary">admin@kuafor.art</div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages */}
        <main className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto flex flex-col gap-8 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
