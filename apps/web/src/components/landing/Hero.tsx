'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Users,
  Sparkles,
  Scissors,
  ChevronRight,
  Clock,
  DollarSign
} from 'lucide-react';

interface HeroProps {
  cmsData?: any;
}

export default function Hero({ cmsData }: HeroProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'finance' | 'customers'>('calendar');
  const [liveAppointments, setLiveAppointments] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAppointments((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-warmbg dark:bg-dark text-navy-900 dark:text-white">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-navy-100/40 via-transparent to-transparent dark:from-navy-900/20 pointer-events-none rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Top Announcement Badge */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-navy-800/80 border border-borderlight dark:border-white/10 shadow-sm text-xs md:text-sm font-semibold text-navy-800 dark:text-gold"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
            </span>
            <span>KUAFÖRLER VE SALONLAR İÇİN TASARLANDI</span>
          </motion.div>
        </div>

        {/* Main Headline & Lead Copy */}
        <div className="mt-8 text-center max-w-4xl mx-auto space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-navy-900 dark:text-white leading-[1.12]"
          >
            {cmsData?.heroTitle || 'Salonunuzu Daha Kolay Yönetin.'} <br className="hidden sm:inline" />
            <span className="italic font-normal text-gold dark:text-gold">Daha Profesyonel Görünün.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-navy-800/75 dark:text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            {cmsData?.heroDescription ||
              'Kuaför.art; 7/24 online randevudan müşteri takibine, kişisel salon web sitenizden gelir raporlarına kadar ihtiyacınız olan her şeyi tek yerde toplar.'}
          </motion.p>

          {/* Primary & Secondary Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={cmsData?.ctaLink || '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-navy-900 hover:bg-navy-800 text-white dark:bg-gold dark:text-navy-950 dark:hover:bg-gold-400 font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-95 text-base"
            >
              <span>{cmsData?.ctaText || 'Ücretsiz Başla'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white dark:bg-navy-900/60 border border-borderlight dark:border-white/15 text-navy-900 dark:text-white font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors text-base"
            >
              <span>Nasıl Çalışır?</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>
          </motion.div>

          {/* Trust Value Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm font-medium text-navy-800/70 dark:text-gray-400"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ücretsiz başla</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dakikalar içinde yayında</span>
            </div>
          </motion.div>
        </div>

        {/* Product Showcase Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto relative"
        >
          {/* Main Mac OS Browser Mockup Frame */}
          <div className="rounded-2xl border border-[#E6E7EA] dark:border-white/10 bg-white dark:bg-[#0E1726] shadow-2xl overflow-hidden">
            {/* Top Browser Title Bar */}
            <div className="h-11 bg-gray-100/80 dark:bg-[#152136] border-b border-gray-200 dark:border-white/10 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>

              <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/70 dark:bg-black/20 border border-black/5 dark:border-white/5 text-xs text-gray-500 font-mono">
                <span>salonunuz.kuafor.art/dashboard</span>
              </div>

              <div className="w-12" />
            </div>

            {/* Mockup Dashboard Content */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-[#0A111E]">
              {/* Left Dashboard Navigation Sidebar */}
              <div className="md:col-span-3 space-y-4">
                <div className="p-3.5 bg-white dark:bg-[#152136] rounded-xl border border-gray-200/80 dark:border-white/5 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-navy-900 dark:bg-gold text-white dark:text-navy-950 flex items-center justify-center font-bold">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-900 dark:text-white">Artisan Hair Studio</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Yayında
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'calendar'
                        ? 'bg-navy-900 text-white dark:bg-gold dark:text-navy-950 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Randevu Takvimi</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'finance'
                        ? 'bg-navy-900 text-white dark:bg-gold dark:text-navy-950 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Kasa & Ciro</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === 'customers'
                        ? 'bg-navy-900 text-white dark:bg-gold dark:text-navy-950 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Müşteri Rehberi</span>
                  </button>
                </div>
              </div>

              {/* Main Interactive Screen Area */}
              <div className="md:col-span-9 space-y-4">
                {/* Stats Header Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-white dark:bg-[#152136] border border-gray-200/80 dark:border-white/5 shadow-sm">
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Bugünkü Randevu</div>
                    <div className="text-xl font-bold text-navy-900 dark:text-white mt-1">{liveAppointments}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#152136] border border-gray-200/80 dark:border-white/5 shadow-sm">
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Günlük Ciro</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₺8.450</div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-[#152136] border border-gray-200/80 dark:border-white/5 shadow-sm">
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Yeni Müşteri</div>
                    <div className="text-xl font-bold text-gold mt-1">+5 Bu Hafta</div>
                  </div>
                </div>

                {/* View Container */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#152136] border border-gray-200/80 dark:border-white/5 shadow-sm min-h-[220px]">
                  {activeTab === 'calendar' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-navy-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/5">
                        <span>Bugün — 25 Ağustos</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">4 Yaklaşan Randevu</span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <div>
                              <span className="font-bold text-navy-900 dark:text-white">15:30 — Burak Yılmaz</span>
                              <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Saç Kesimi & Sakal Şekillendirme</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold">Onaylandı</span>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-navy-900/50 border border-gray-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="font-bold text-navy-900 dark:text-white">16:45 — Selin Aksoy</span>
                              <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Boya & Fön</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-gray-300 text-[10px] font-bold">Bekliyor</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'finance' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-navy-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/5">
                        <span>Aylık Gelir Özeti</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">%24 Artış</span>
                      </div>
                      <div className="h-32 flex items-end gap-2 pt-4">
                        {[40, 65, 55, 80, 70, 95, 85].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              style={{ height: `${val}%` }}
                              className="w-full bg-navy-900 dark:bg-gold rounded-t-sm opacity-90 hover:opacity-100 transition-all"
                            />
                            <span className="text-[9px] text-gray-400">G{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'customers' && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-navy-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/5">
                        Müşteri Sadakat Kayıtları
                      </div>
                      {[
                        { name: 'Ayşe Kaya', visits: 12, total: '₺4.200', tag: 'VIP' },
                        { name: 'Mehmet Demir', visits: 8, total: '₺2.150', tag: 'Düzenli' }
                      ].map((c, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-gray-50 dark:bg-navy-900/40 border border-gray-200/50 dark:border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-navy-900 dark:text-white">{c.name}</span>
                            <span className="text-gray-400 text-[10px] block">{c.visits} Toplam Ziyaret</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-navy-900 dark:text-gold">{c.total}</span>
                            <span className="px-2 py-0.5 ml-2 rounded bg-gold/20 text-gold text-[10px] font-bold">{c.tag}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Benefit Card 1: WhatsApp Notification */}
          <div className="hidden lg:flex absolute -left-10 top-1/3 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-borderlight dark:border-white/10 shadow-2xl items-center gap-3.5 z-30 max-w-xs animate-bounce-slow">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-navy-900 dark:text-white">Otomatik WhatsApp</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Hatırlatma mesajı gönderildi</div>
            </div>
          </div>

          {/* Floating Benefit Card 2: 7/24 Storefront */}
          <div className="hidden lg:flex absolute -right-10 bottom-12 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-borderlight dark:border-white/10 shadow-2xl items-center gap-3.5 z-30 max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-gold text-navy-950 flex items-center justify-center font-bold">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-navy-900 dark:text-white">Kişisel Web Sayfanız</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">adiniz.kuafor.art 7/24 Yayında</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
