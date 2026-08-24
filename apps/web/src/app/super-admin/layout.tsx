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
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`px-6 py-3.5 rounded-2xl flex items-center gap-3 transition-colors text-sm font-semibold tracking-wide ${
          isActive
            ? "bg-purple-500/15 border border-purple-500/30 text-purple-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(167,139,250,0.15)]"
            : "text-gray-600 dark:text-[#a78bfa]/60 hover:bg-gray-100 dark:hover:bg-purple-950/30 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
      </motion.div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#07010e] text-gray-900 dark:text-[#eadef7] font-sans flex overflow-hidden relative transition-colors duration-200 ease-in-out">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[5%] left-[5%] w-[450px] h-[450px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[130px] pointer-events-none" />

      {/* Super Admin Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex flex-col justify-between border-r border-gray-200 dark:border-[#a78bfa]/10 bg-white/90 dark:bg-[#0c051a]/90 backdrop-blur-xl h-screen sticky top-0 p-6 z-40 transition-colors duration-200"
          >
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-200 dark:border-[#a78bfa]/10 pb-6">
                <div>
                  <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 uppercase">
                    Kuafor.art
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 uppercase shadow-sm block w-fit mt-1">
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
            <div className="border-t border-gray-200 dark:border-[#a78bfa]/10 pt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-gray-500 font-semibold">Görünüm</span>
                <ThemeToggle />
              </div>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 transition-all"
                >
                  ← Platforma Dön
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 transition-all"
              >
                Çıkış Yap
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="px-6 py-4 border-b border-gray-200 dark:border-[#a78bfa]/10 bg-white/80 dark:bg-[#0c051a]/40 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border border-gray-200 dark:border-[#a78bfa]/10 bg-gray-100 dark:bg-[#120822] hover:bg-gray-200 dark:hover:bg-[#1a0f30] text-sm hidden md:block text-gray-700 dark:text-gray-300"
            >
              ☰
            </button>
            <h2 className="font-extrabold text-base tracking-wide uppercase text-gray-900 dark:text-white">
              {menuItems.find((item) => item.href === pathname)?.label || "Süper Admin Yönetim Paneli"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <div className="text-right">
              <div className="text-xs font-bold text-gray-900 dark:text-white">Platform Owner</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">admin@kuafor.art</div>
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
