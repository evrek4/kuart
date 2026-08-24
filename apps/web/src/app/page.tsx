'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion, useScroll, useSpring } from 'framer-motion';
import Hero from '@/components/landing/Hero';
import Timeline from '@/components/landing/Timeline';
import WhatsAppChat from '@/components/landing/WhatsAppChat';
import Loyalty from '@/components/landing/Loyalty';
import FinancePanel from '@/components/landing/FinancePanel';
import OnlineStorefront from '@/components/landing/OnlineStorefront';
import Pricing from '@/components/landing/Pricing';

// Super Admin CMS API Endpoint
const CMS_API_URL = 'http://localhost:3001/api/public/landing';

export default function LandingPage() {
  const [cmsData, setCmsData] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Fetch published CMS data
    fetch(CMS_API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCmsData(data.data);
      })
      .catch(err => console.error("CMS data fetch error:", err));

    // Detect and apply theme
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark' ||
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  if (!cmsData) {
    // Elegant loading state
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-t-2 border-l-2 border-indigo-500"
        />
      </div>
    );
  }

  const { activeSections = {} } = cmsData;

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Head>
        <title>{cmsData.seoTitle || 'Premium Salon OS'}</title>
        <meta name="description" content={cmsData.seoDescription || 'Salonunuzun işletim sistemi.'} />
        {cmsData.favicon && <link rel="icon" href={cmsData.favicon} />}
      </Head>

      {/* Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-50"
        style={{ scaleX }}
      />

      <main className="flex flex-col w-full relative">
        {/* 04 - HERO & INTERACTION */}
        <Hero cmsData={cmsData} />

        {/* 05 - SALONUNUZ ÇALIŞIRKEN (TIMELINE) */}
        {activeSections.timeline !== false && <Timeline />}

        {/* 06 - NO-SHOW SECTION & WHATSAPP CHAT */}
        {activeSections.chat !== false && <WhatsAppChat />}

        {/* 07 - SADAKAT SECTION */}
        {activeSections.loyalty !== false && <Loyalty />}

        {/* 08 - KASA & COUNTER ANIMATIONS */}
        {activeSections.finance !== false && <FinancePanel />}

        {/* 09 - ONLINE VİTRİN SECTION */}
        {activeSections.storefront !== false && <OnlineStorefront />}

        {/* 10 - PRICING */}
        {activeSections.pricing !== false && <Pricing />}
      </main>

      {/* Footer Minimalist */}
      <footer className="py-12 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            {cmsData.logoLight || cmsData.logoDark ? (
              <>
                {cmsData.logoLight && <img src={cmsData.logoLight} alt="Logo" className="h-8 dark:hidden block" />}
                {cmsData.logoDark && <img src={cmsData.logoDark} alt="Logo" className="h-8 hidden dark:block" />}
                {!cmsData.logoLight && cmsData.logoDark && <img src={cmsData.logoDark} alt="Logo" className="h-8" />}
              </>
            ) : (
              <span className="font-bold text-xl tracking-tight">KuaforArt</span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} KuaforArt. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>

      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-md text-gray-900 dark:text-white hover:scale-110 active:scale-95 transition-all"
        aria-label="Tema Değiştir"
      >
        {theme === 'dark' ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </div>
  );
}

