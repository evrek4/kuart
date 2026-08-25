'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Globe,
  Users,
  PieChart,
  UserCheck,
  BellRing,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const pillars = [
  {
    id: 'appointments',
    icon: CalendarCheck,
    title: 'Akıllı Randevu Takvimi',
    badge: '7/24 Online',
    description: 'WhatsApp karmaşasına son verin. Müşterileriniz boş saatlerinizi görüp anında randevu alır. Çift rezervasyon riski tamamen ortadan kalkar.',
    stat: '%40 Daha Fazla Randevu'
  },
  {
    id: 'website',
    icon: Globe,
    title: 'Kişisel Salon Web Sitesi',
    badge: 'adiniz.kuafor.art',
    description: 'Instagram biyonuza ekleyeceğiniz profesyonel sayfanızla salona özel marka imajı yaratın. Hizmetlerinizi, fiyatlarınızı ve salon fotoğraflarınızı sergileyin.',
    stat: 'Prestijli Dijital Kimlik'
  },
  {
    id: 'customers',
    icon: Users,
    title: 'Müşteri Hafızası & CRM',
    badge: 'Sadakat Takibi',
    description: 'Müşterinizin tercih ettiği saç boyası numarasından son geliş tarihine kadar tüm geçmiş detayları kaydedin. Kişiselleştirilmiş hizmet sunun.',
    stat: '%85 Müşteri Tutundurma'
  },
  {
    id: 'finance',
    icon: PieChart,
    title: 'Kasa, Ciro & Gelir Analizi',
    badge: 'Anlık Rapor',
    description: 'Hangi hizmetin ne kadar kazandırdığını, günlük ve aylık cironuzu tek dokunuşla görün. Kayıp-kaçak oranını sıfırlayın.',
    stat: '%100 Finansal Kontrol'
  },
  {
    id: 'staff',
    icon: UserCheck,
    title: 'Personel Performansı & Prim',
    badge: 'Ekip Yönetimi',
    description: 'Hangi personelin kaç randevu tamamladığını, hak ettiği primi ve çalışma saatlerini otomatik hesaplayın.',
    stat: 'Adil & Şeffaf Prim'
  }
];

export default function Positioning() {
  const [activePillar, setActivePillar] = useState(pillars[0]);

  return (
    <section className="py-24 bg-white dark:bg-[#070D18] border-y border-[#E6E7EA] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold tracking-widest text-gold uppercase">
            TÜM İHTİYAÇLARINIZ TEK YERDE
          </span>
          <h2 className="mt-3 font-serif text-3xl md:text-5xl font-bold text-navy-900 dark:text-white leading-tight">
            Bu Sadece Bir Randevu Sistemi Değil. <br />
            <span className="italic text-navy-700 dark:text-gray-300 font-normal">Salonunuzun Dijital İşletim Sistemi.</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-navy-800/70 dark:text-gray-400">
            Salonunuzu büyütmek, müşterilerinizi elde tutmak ve ekibinizi yönetmek için ayrı ayrı 5 farklı program kullanmanıza gerek yok.
          </p>
        </div>

        {/* Editorial Split Showcase */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Pillar List */}
          <div className="lg:col-span-5 space-y-3">
            {pillars.map((item) => {
              const Icon = item.icon;
              const isActive = activePillar.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePillar(item)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-start gap-4 border ${
                    isActive
                      ? 'bg-navy-900 text-white dark:bg-gold dark:text-navy-950 border-navy-900 dark:border-gold shadow-xl scale-[1.01]'
                      : 'bg-warmbg dark:bg-navy-900/40 text-navy-900 dark:text-gray-200 border-borderlight dark:border-white/5 hover:border-navy-900/30 dark:hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/10 dark:bg-navy-950/20 text-white dark:text-navy-950'
                        : 'bg-white dark:bg-navy-800 text-navy-900 dark:text-gold shadow-sm'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base">{item.title}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-navy-950/20 dark:text-navy-950'
                            : 'bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p
                      className={`mt-1.5 text-xs line-clamp-2 ${
                        isActive ? 'text-white/80 dark:text-navy-950/80' : 'text-navy-800/70 dark:text-gray-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Editorial Preview Display */}
          <div className="lg:col-span-7 sticky top-28">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="p-8 md:p-10 rounded-3xl bg-warmbg dark:bg-navy-900 border border-borderlight dark:border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Background Decorative Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider">
                  {activePillar.badge}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activePillar.stat}
                </span>
              </div>

              <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-navy-900 dark:text-white">
                {activePillar.title}
              </h3>

              <p className="mt-3 text-sm md:text-base text-navy-800/80 dark:text-gray-300 leading-relaxed">
                {activePillar.description}
              </p>

              {/* Mockup Card Feature Card */}
              <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-[#111A2E] border border-borderlight dark:border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                  <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    {activePillar.title} Görünümü
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">Canlı Önizleme</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-navy-950/50 border border-gray-200/50 dark:border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Ana Avantaj</div>
                    <div className="text-sm font-bold text-navy-900 dark:text-white mt-0.5">{activePillar.stat}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-navy-950/50 border border-gray-200/50 dark:border-white/5">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Kurulum Süresi</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Yalnızca 2 Dakika</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-xs font-medium text-navy-900 dark:text-gold flex items-center justify-between">
                  <span>Bu modül ücretsiz pakete dahildir.</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
