'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Globe,
  Users,
  PieChart,
  UserCheck
} from 'lucide-react';

const pillars = [
  {
    id: 'appointments',
    icon: CalendarCheck,
    title: 'Akıllı Randevu Takvimi',
    badge: '7/24 Online',
    description: 'WhatsApp karmaşasına son verin. Müşterileriniz boş saatlerinizi görüp anında randevu alır. Çift rezervasyon riski tamamen ortadan kalkar.',
  },
  {
    id: 'website',
    icon: Globe,
    title: 'Kişisel Salon Web Sitesi',
    badge: 'adiniz.kuafor.art',
    description: 'Instagram biyonuza ekleyeceğiniz profesyonel sayfanızla salona özel marka imajı yaratın. Hizmetlerinizi, fiyatlarınızı ve salon fotoğraflarınızı sergileyin.',
  },
  {
    id: 'customers',
    icon: Users,
    title: 'Müşteri Hafızası & CRM',
    badge: 'Sadakat Takibi',
    description: 'Müşterinizin tercih ettiği saç boyası numarasından son geliş tarihine kadar tüm geçmiş detayları kaydedin. Kişiselleştirilmiş hizmet sunun.',
  },
  {
    id: 'finance',
    icon: PieChart,
    title: 'Kasa, Ciro & Gelir Analizi',
    badge: 'Anlık Rapor',
    description: 'Hangi hizmetin ne kadar kazandırdığını, günlük ve aylık cironuzu tek dokunuşla görün. Kayıp-kaçak oranını sıfırlayın.',
  },
  {
    id: 'staff',
    icon: UserCheck,
    title: 'Personel Performansı & Prim',
    badge: 'Ekip Yönetimi',
    description: 'Hangi personelin kaç randevu tamamladığını, hak ettiği primi ve çalışma saatlerini otomatik hesaplayın.',
  }
];

export default function Positioning() {
  const [activePillar, setActivePillar] = useState(pillars[0]);

  return (
    <section className="py-24 bg-warmbg dark:bg-dark-DEFAULT border-y border-borderlight dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border text-[11px] font-semibold tracking-widest text-lightText-secondary dark:text-darkText-secondary uppercase shadow-sm">
            PLATFORM ÖZELLİKLERİ
          </span>
          <h2 className="mt-5 font-serif text-3xl md:text-[2.75rem] font-bold text-lightText-primary dark:text-darkText-primary leading-tight">
            Salonunuzu Yönetmek Hiç Bu <br className="hidden md:block" />
            Kadar Kolay Olmamıştı
          </h2>
          <p className="mt-4 text-[16px] text-lightText-secondary dark:text-darkText-secondary max-w-2xl mx-auto">
            Salonunuzu büyütmek, müşterilerinizi elde tutmak ve ekibinizi yönetmek için ayrı ayrı 5 farklı program kullanmanıza gerek yok. Tüm dijital altyapınız tek yerde.
          </p>
        </div>

        {/* Editorial Split Showcase */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Interactive Pillar List */}
          <div className="lg:col-span-5 space-y-2">
            {pillars.map((item) => {
              const Icon = item.icon;
              const isActive = activePillar.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePillar(item)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-start gap-4 border ${
                    isActive
                      ? 'bg-white dark:bg-dark-highlight text-lightText-primary dark:text-darkText-primary border-borderlight dark:border-dark-border shadow-sm'
                      : 'bg-transparent text-lightText-secondary dark:text-darkText-secondary border-transparent hover:bg-gray-100/50 dark:hover:bg-dark-card/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-gray-100 dark:bg-[#1C3A63] text-navy-900 dark:text-white'
                        : 'bg-white dark:bg-dark-card text-lightText-muted dark:text-darkText-muted border border-borderlight dark:border-dark-border'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[15px]">{item.title}</span>
                    </div>
                    <p
                      className={`mt-1 text-[13px] leading-relaxed line-clamp-2 ${
                        isActive ? 'text-lightText-secondary dark:text-darkText-secondary' : 'text-lightText-muted dark:text-darkText-muted'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Static Information Preview Display */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-10 rounded-xl bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded bg-gray-50 dark:bg-dark-highlight border border-borderlight dark:border-transparent text-lightText-secondary dark:text-darkText-primary text-[10px] font-bold uppercase tracking-wider">
                  {activePillar.badge}
                </span>
              </div>

              <h3 className="font-serif text-2xl md:text-3xl font-bold text-lightText-primary dark:text-darkText-primary">
                {activePillar.title}
              </h3>

              <p className="mt-4 text-[15px] text-lightText-secondary dark:text-darkText-secondary leading-relaxed">
                {activePillar.description}
              </p>

              {/* Simple Feature Demo Box */}
              <div className="mt-8 p-5 rounded-lg border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E]">
                <div className="flex items-center justify-between border-b border-borderlight dark:border-dark-border pb-3 mb-4">
                  <span className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary">Modül Özeti</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-lightText-muted dark:text-darkText-muted">Durum</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tüm Paketlerde Aktif</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-lightText-muted dark:text-darkText-muted">Kullanım Kolaylığı</span>
                    <span className="font-semibold text-lightText-primary dark:text-darkText-primary">Yüksek</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
