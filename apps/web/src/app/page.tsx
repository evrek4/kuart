'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Positioning from '@/components/landing/Positioning';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import OnlineStorefront from '@/components/landing/OnlineStorefront';
import Timeline from '@/components/landing/Timeline';
import Pricing from '@/components/landing/Pricing';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

// Super Admin CMS API Endpoint
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const CMS_API_URL = `${API_BASE}/api/public/landing`;

export default function LandingPage() {
  const [cmsData, setCmsData] = useState<any>(null);
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
        if (data.success && data.data) setCmsData(data.data);
        else setCmsData({ activeSections: {} });
      })
      .catch(err => {
        console.error("CMS data fetch error:", err);
        setCmsData({ activeSections: {} });
      });
  }, []);

  if (!cmsData) {
    // Elegant loading state
    return (
      <div className="min-h-screen bg-[#F8F8F6] dark:bg-[#0A111E] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-2 border-navy-900 dark:border-gold border-t-transparent"
        />
      </div>
    );
  }

  const { activeSections = {} } = cmsData;

  return (
    <div className="min-h-screen bg-warmbg dark:bg-[#0A111E] text-navy-900 dark:text-white font-sans selection:bg-gold/30 overflow-x-hidden">
      <Head>
        <title>{cmsData.seoTitle || 'Kuaför.art — Salon ve Kuaför Randevu & Yönetim Sistemi'}</title>
        <meta name="description" content={cmsData.seoDescription || 'Salonunuzu daha kolay yönetin. Randevu, müşteri, kişisel web sitesi ve kasa yönetim sistemi.'} />
        {cmsData.favicon && <link rel="icon" href={cmsData.favicon} />}
      </Head>

      {/* Top Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gold origin-left z-50"
        style={{ scaleX }}
      />

      {/* Header Navbar */}
      <Navbar cmsData={cmsData} />

      {/* Main Page Sections */}
      <main className="flex flex-col w-full relative">
        {/* 01 - Hero & Interactive Product Showcase */}
        <Hero cmsData={cmsData} />

        {/* 02 - Positioning (Not Just Appointment) */}
        <Positioning />

        {/* 03 - Feature Showcase (Editorial Layouts) */}
        <FeatureShowcase />

        {/* 04 - Kişisel Web Siteniz */}
        <OnlineStorefront />

        {/* 05 - Nasıl Çalışır? (Timeline) */}
        {activeSections.timeline !== false && <Timeline />}

        {/* 06 - Fiyatlandırma */}
        {activeSections.pricing !== false && <Pricing />}

        {/* 07 - Final CTA */}
        <FinalCTA />
      </main>

      {/* 08 - Footer */}
      <Footer />
    </div>
  );
}

