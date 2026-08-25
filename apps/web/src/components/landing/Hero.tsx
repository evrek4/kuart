'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Calendar,
  TrendingUp,
  Users,
  Scissors,
  Clock
} from 'lucide-react';

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'finance' | 'customers'>('calendar');
  const [liveAppointments, setLiveAppointments] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAppointments((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-white dark:bg-dark-DEFAULT text-lightText-primary dark:text-darkText-primary selection:bg-gold/30">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-center">
        
        {/* LEFT COLUMN: Copy & Actions */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-dark-card border border-borderlight dark:border-dark-border text-xs font-semibold text-lightText-secondary dark:text-darkText-secondary tracking-wide uppercase shadow-sm">
              KUAFÖRLER İÇİN TASARLANDI
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-lightText-primary dark:text-darkText-primary leading-[1.1]">
              Salonunuz İçin <br />
              Profesyonel <br />
              <span className="italic font-normal">Bir Dijital Kimlik</span>
            </h1>
            
            {/* Elegant Accent Line */}
            <div className="w-16 h-1 bg-gold rounded-full" />
            
            <p className="text-[17px] text-lightText-secondary dark:text-darkText-secondary font-medium leading-relaxed max-w-lg">
              Randevu yönetimi, müşteri takibi ve kişisel web sitenizle salonunuzu geleceğe taşıyın. İşinizi tek bir yerden, profesyonelce yönetin.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold rounded-lg transition-opacity hover:opacity-90 text-[15px]"
            >
              <span>Ücretsiz Başla</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-transparent border border-[#0B1933] text-[#0B1933] dark:border-white/20 dark:text-[#F7F8FA] font-semibold rounded-lg hover:opacity-90 transition-opacity text-[15px]"
            >
              Nasıl Çalışır?
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-4 text-xs font-semibold text-lightText-muted dark:text-darkText-muted"
          >
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ücretsiz başla</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Dakikalar içinde yayında</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Product Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-7 relative"
        >
          {/* Main Mac OS Browser Mockup Frame */}
          <div className="rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-dark-card shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden relative z-10">
            {/* Top Browser Title Bar */}
            <div className="h-10 bg-[#F8F9FA] dark:bg-[#09101E] border-b border-borderlight dark:border-dark-border px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-white dark:bg-[#0A111E] border border-borderlight/50 dark:border-dark-border text-[10px] text-lightText-muted font-mono">
                <span>salonunuz.kuafor.art/dashboard</span>
              </div>
              <div className="w-10" />
            </div>

            {/* Mockup Dashboard Content */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-0 bg-[#FAFAFA] dark:bg-dark-DEFAULT">
              {/* Sidebar */}
              <div className="sm:col-span-3 border-r border-borderlight dark:border-dark-border p-4 space-y-4 hidden sm:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded bg-navy-900 dark:bg-gold text-white dark:text-navy-950 flex items-center justify-center font-bold">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary leading-tight">Artisan Studio</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === 'calendar'
                        ? 'bg-white dark:bg-dark-highlight text-lightText-primary dark:text-darkText-primary shadow-sm border border-borderlight dark:border-transparent'
                        : 'text-lightText-secondary dark:text-darkText-muted hover:bg-gray-100 dark:hover:bg-[#0E1D34]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Randevu Takvimi</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === 'finance'
                        ? 'bg-white dark:bg-dark-highlight text-lightText-primary dark:text-darkText-primary shadow-sm border border-borderlight dark:border-transparent'
                        : 'text-lightText-secondary dark:text-darkText-muted hover:bg-gray-100 dark:hover:bg-[#0E1D34]'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Kasa & Ciro</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === 'customers'
                        ? 'bg-white dark:bg-dark-highlight text-lightText-primary dark:text-darkText-primary shadow-sm border border-borderlight dark:border-transparent'
                        : 'text-lightText-secondary dark:text-darkText-muted hover:bg-gray-100 dark:hover:bg-[#0E1D34]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Müşteri Rehberi</span>
                  </button>
                </div>
              </div>

              {/* Main Area */}
              <div className="sm:col-span-9 p-5 space-y-4">
                {/* Stats Header Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm">
                    <div className="text-[10px] font-medium text-lightText-muted dark:text-darkText-muted uppercase tracking-wider">Randevu</div>
                    <div className="text-lg font-bold text-lightText-primary dark:text-darkText-primary mt-0.5">{liveAppointments}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm">
                    <div className="text-[10px] font-medium text-lightText-muted dark:text-darkText-muted uppercase tracking-wider">Günlük Ciro</div>
                    <div className="text-lg font-bold text-lightText-primary dark:text-darkText-primary mt-0.5">₺8.450</div>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm">
                    <div className="text-[10px] font-medium text-lightText-muted dark:text-darkText-muted uppercase tracking-wider">Yeni Müşteri</div>
                    <div className="text-lg font-bold text-lightText-primary dark:text-darkText-primary mt-0.5">+5</div>
                  </div>
                </div>

                {/* View Container */}
                <div className="p-4 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm min-h-[180px]">
                  {activeTab === 'calendar' && (
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary pb-2 border-b border-borderlight dark:border-dark-border">
                        Bugün — 25 Ağustos
                      </div>

                      <div className="space-y-2">
                        <div className="p-2.5 rounded border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-3.5 h-3.5 text-lightText-muted" />
                            <div>
                              <span className="font-semibold text-lightText-primary dark:text-darkText-primary block leading-tight">15:30 — Burak Yılmaz</span>
                              <span className="text-[10px] text-lightText-secondary dark:text-darkText-secondary">Saç Kesimi & Sakal Şekillendirme</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] font-bold uppercase">Onaylandı</span>
                        </div>

                        <div className="p-2.5 rounded border border-borderlight dark:border-dark-border bg-white dark:bg-dark-highlight flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-3.5 h-3.5 text-lightText-muted" />
                            <div>
                              <span className="font-semibold text-lightText-primary dark:text-darkText-primary block leading-tight">16:45 — Selin Aksoy</span>
                              <span className="text-[10px] text-lightText-secondary dark:text-darkText-secondary">Boya & Fön</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-sm bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-[9px] font-bold uppercase">Bekliyor</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'finance' && (
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary pb-2 border-b border-borderlight dark:border-dark-border">
                        Aylık Gelir Özeti
                      </div>
                      <div className="h-24 flex items-end gap-1.5 pt-4">
                        {[40, 65, 55, 80, 70, 95, 85].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              style={{ height: `${val}%` }}
                              className="w-full bg-navy-900 dark:bg-gold rounded-t-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'customers' && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary pb-2 border-b border-borderlight dark:border-dark-border">
                        Müşteri Kayıtları
                      </div>
                      {[
                        { name: 'Ayşe Kaya', visits: 12, total: '₺4.200' },
                        { name: 'Mehmet Demir', visits: 8, total: '₺2.150' }
                      ].map((c, i) => (
                        <div key={i} className="p-2 rounded border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-lightText-primary dark:text-darkText-primary block">{c.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lightText-primary dark:text-darkText-primary">{c.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Floating Card */}
          <div className="hidden lg:flex absolute -right-6 top-12 p-3 rounded-lg bg-white dark:bg-dark-highlight border border-borderlight dark:border-dark-border shadow-md items-center gap-3 z-20 max-w-[200px]">
            <div className="w-8 h-8 rounded bg-[#F2F5F9] dark:bg-[#081326] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-navy-900 dark:text-gold" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary">7/24 Online Randevu</div>
              <div className="text-[10px] text-lightText-muted dark:text-darkText-muted">Otomatik senkronizasyon</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
