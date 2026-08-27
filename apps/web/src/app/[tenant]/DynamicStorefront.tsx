"use client";

import React, { useEffect, useState } from 'react';
import SimpleMinimalistTheme from '../../components/storefront/simple/SimpleMinimalistTheme';
import SimpleModernDarkTheme from '../../components/storefront/simple/SimpleModernDarkTheme';
import SimpleLuxuryCompactTheme from '../../components/storefront/simple/SimpleLuxuryCompactTheme';
import PortalBasicTheme from '../../components/storefront/portal/PortalBasicTheme';
import PortalGoldTheme from '../../components/storefront/portal/PortalGoldTheme';
import PortalPremiumTheme from '../../components/storefront/portal/PortalPremiumTheme';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function DynamicStorefront({ data }: { data: any }) {
  /**
   * [PHASE 5] Hydration Mismatch Koruması
   *
   * Temalar ThemeToggle / localStorage'a bağlı olduğu için SSR'de
   * server ile client arasında HTML uyumsuzluğu oluşabilir.
   * isMounted flag'i ile tema render'ı yalnızca client mount sonrası
   * gerçekleşir; böylece Next.js hydration hatası önlenir.
   */
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (data) {
      console.log('[Storefront Client]: Salon verisi yüklendi:', data);
    }
  }, [data]);

  if (!data || !data.tenant) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-500 text-2xl font-bold">
          !
        </div>
        <h2 className="text-2xl font-black mb-2 text-red-500 uppercase tracking-wider">
          SALON BULUNAMADI
        </h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          İstenen salon verileri sunucudan yüklenemedi veya salon pasif durumda.
        </p>
        <a 
          href="/" 
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
        >
          Ana Sayfaya Dön
        </a>
      </div>
    );
  }

  if (!isMounted) return null;

  const selectedThemeId = data.settings?.selectedThemeId || 'SIMPLE_MINIMALIST';

  const props = {
    tenant: data.tenant || {},
    settings: data.settings || {},
    services: Array.isArray(data.services) ? data.services : [],
    staff: Array.isArray(data.staff) ? data.staff : [],
  };

  const renderTheme = () => {
    switch (selectedThemeId) {
      case 'SIMPLE_MODERN_DARK':
        return <SimpleModernDarkTheme {...props} />;
      case 'SIMPLE_LUXURY_COMPACT':
        return <SimpleLuxuryCompactTheme {...props} />;
      case 'PORTAL_BASIC':
        return <PortalBasicTheme {...props} />;
      case 'PORTAL_GOLD':
        return <PortalGoldTheme {...props} />;
      case 'PORTAL_PREMIUM':
        return <PortalPremiumTheme {...props} />;
      case 'SIMPLE_MINIMALIST':
      default:
        return <SimpleMinimalistTheme {...props} />;
    }
  };

  const planName = (
    typeof data.tenant?.plan === "string"
      ? data.tenant?.plan
      : data.tenant?.plan?.name || data.plan || "FREE"
  ).toUpperCase();
  const isFreePlan = planName === "FREE";

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      {/* Floating Storefront Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle className="shadow-lg backdrop-blur-md bg-white/80 dark:bg-black/60 border border-neutral-200 dark:border-white/15" />
      </div>

      <div className="flex-1">
        {renderTheme()}
      </div>

      {/* FREE Paket Branding Footer Rozeti */}
      {isFreePlan && (
        <div className="w-full py-6 flex justify-center items-center relative z-20">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary hover:border-primary/30 transition-all shadow-sm hover:scale-105"
          >
            <span className="text-amber-500">⚡</span>
            <span>Kuafor.art altyapısıyla güçlendirilmiştir</span>
          </a>
        </div>
      )}
    </div>
  );
}
