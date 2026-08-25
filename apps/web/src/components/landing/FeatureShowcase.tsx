'use client';

import React from 'react';
import {
  Calendar,
  MessageSquare,
  Globe,
  TrendingUp,
  UserCheck,
  Scissors,
} from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Akıllı Randevu Sistemi',
    description: 'Telefon başında saatler harcamayın. Müşterileriniz boş saatlerinizi görüp anında randevu oluşturur.',
    icon: Calendar,
    isPopular: false
  },
  {
    id: 2,
    title: 'Kişisel Web Sayfanız',
    description: 'Instagram biyonuza ekleyeceğiniz profesyonel sayfanızla 7/24 randevu kabul edin. Fiyatlarınızı sergileyin.',
    icon: Globe,
    isPopular: true // The highlighted deep navy card
  },
  {
    id: 3,
    title: 'Müşteri Yönetimi (CRM)',
    description: 'Müşterilerinizin geçmiş randevularını, boya numaralarını ve özel isteklerini sistem hafızasında tutun.',
    icon: UserCheck,
    isPopular: false
  },
  {
    id: 4,
    title: 'Gelir & Raporlama',
    description: 'Hangi hizmetin ne kadar kazandırdığını, günlük ve aylık cironuzu tek dokunuşla görün. Kasanız kontrolünüzde.',
    icon: TrendingUp,
    isPopular: false
  },
  {
    id: 5,
    title: 'WhatsApp Hatırlatmaları',
    description: 'Müşterilerinize randevudan 2 saat önce otomatik WhatsApp hatırlatma mesajı göndererek gelmeme (no-show) oranını azaltın.',
    icon: MessageSquare,
    isPopular: false
  },
  {
    id: 6,
    title: 'Personel Prim Takibi',
    description: 'Hangi personelin kaç randevu tamamladığını ve hak ettiği primi otomatik olarak hatasız hesaplayın.',
    icon: Scissors,
    isPopular: false
  }
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-dark-DEFAULT">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-dark-card border border-borderlight dark:border-dark-border text-[11px] font-semibold tracking-widest text-lightText-secondary dark:text-darkText-secondary uppercase shadow-sm">
            ÖNE ÇIKAN SİSTEM ÖZELLİKLERİ
          </span>
          <h2 className="font-serif text-3xl md:text-[2.75rem] font-bold text-lightText-primary dark:text-darkText-primary leading-tight">
            İşinizi Kolaylaştıran <br />
            <span className="italic font-normal">Güçlü Özellikler</span>
          </h2>
          <p className="text-[16px] text-lightText-secondary dark:text-darkText-secondary max-w-2xl mx-auto">
            Sistem sizin yerinize randevu toplasın, hatırlatsın ve raporlasın. Siz sadece işinize odaklanın.
          </p>
        </div>

        {/* 3-Column / 4-Column Grid based on layout preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            if (feature.isPopular) {
              // Highlighted Card
              return (
                <div key={feature.id} className="p-8 rounded-xl bg-navy-900 dark:bg-dark-highlight border border-navy-800 dark:border-dark-border shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-lg bg-navy-800 dark:bg-[#1C3A63] text-white flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                        POPÜLER
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            }

            // Normal Card
            return (
              <div key={feature.id} className="p-8 rounded-xl bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-[#0A111E] border border-borderlight dark:border-transparent text-lightText-primary dark:text-darkText-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-lightText-primary dark:text-darkText-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-lightText-secondary dark:text-darkText-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
