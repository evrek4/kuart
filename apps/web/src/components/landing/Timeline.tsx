'use client';

import React from 'react';
import { MousePointerClick, Zap, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Kayıt Olun & Profilinizi Açın',
    description: 'Saniyeler içinde hesabınızı oluşturun. Salonunuzun adı, logosu ve çalışma saatleriyle dijital kimliğinizi kurun.',
    icon: MousePointerClick,
  },
  {
    id: 2,
    title: 'Hizmet ve Fiyatları Ekleyin',
    description: 'Verdiğiniz hizmetleri (örn: Saç Kesimi, Fön, Boya) ve güncel fiyatlarınızı sisteme girin. Personellerinizi tanımlayın.',
    icon: Zap,
  },
  {
    id: 3,
    title: 'Linkinizi Paylaşın ve Başlayın',
    description: 'Size özel linki (adiniz.kuafor.art) Instagram profilinize ekleyin. Müşterileriniz anında randevu almaya başlasın.',
    icon: CheckCircle2,
  },
];

export default function Timeline() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-dark-DEFAULT">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-dark-card border border-borderlight dark:border-dark-border text-[11px] font-semibold tracking-widest text-lightText-secondary dark:text-darkText-secondary uppercase shadow-sm">
            KURULUM
          </span>
          <h2 className="mt-5 font-serif text-3xl md:text-[2.75rem] font-bold text-lightText-primary dark:text-darkText-primary leading-tight">
            Sadece 3 Adımda <br className="hidden sm:block" />
            <span className="italic font-normal">Sisteminizi Kurun</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-borderlight dark:bg-dark-border -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex flex-col items-center text-center">
                  
                  {/* Step Number Badge */}
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm flex items-center justify-center mb-6 relative">
                    <span className="absolute -top-3 -right-3 w-7 h-7 rounded bg-navy-900 dark:bg-gold text-white dark:text-navy-950 text-[12px] font-bold flex items-center justify-center shadow-sm">
                      {step.id}
                    </span>
                    <Icon className="w-7 h-7 text-lightText-primary dark:text-darkText-primary" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-lightText-primary dark:text-darkText-primary mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-[14px] text-lightText-secondary dark:text-darkText-secondary leading-relaxed max-w-[280px]">
                    {step.description}
                  </p>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
