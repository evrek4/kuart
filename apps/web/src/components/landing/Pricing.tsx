'use client';

import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-warmbg dark:bg-dark-DEFAULT border-y border-borderlight dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border text-[11px] font-semibold tracking-widest text-lightText-secondary dark:text-darkText-secondary uppercase shadow-sm">
            ŞEFFAF FİYATLANDIRMA
          </span>
          <h2 className="mt-5 font-serif text-3xl md:text-[2.75rem] font-bold text-lightText-primary dark:text-darkText-primary leading-tight">
            İşletmeniz İçin <br className="hidden sm:block" />
            <span className="italic font-normal">En Uygun Planı Seçin</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Plan */}
          <div className="p-8 md:p-10 rounded-xl bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border shadow-sm flex flex-col">
            <h3 className="font-serif text-2xl font-bold text-lightText-primary dark:text-darkText-primary mb-2">Başlangıç</h3>
            <p className="text-[14px] text-lightText-secondary dark:text-darkText-secondary mb-6">Yeni başlayan bağımsız profesyoneller için.</p>
            
            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-lightText-primary dark:text-darkText-primary">₺0</span>
              <span className="text-lightText-muted dark:text-darkText-muted font-medium">/ ömür boyu</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                'Aylık 50 Randevu Limiti',
                'Temel Web Sayfası (kuafor.art/isim)',
                '1 Personel Tanımlama',
                'Standart Müşteri Kaydı',
                'WhatsApp Randevu Bildirimi (Manuel)'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 p-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[14px] font-medium text-lightText-secondary dark:text-darkText-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full py-3.5 text-center bg-transparent border border-[#0B1933] text-[#0B1933] dark:border-white/20 dark:text-[#F7F8FA] font-bold rounded-lg transition-opacity hover:opacity-90 text-[14px]"
            >
              Hemen Başla
            </Link>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="p-8 md:p-10 rounded-xl bg-navy-900 dark:bg-dark-highlight border border-navy-800 dark:border-dark-border shadow-sm flex flex-col relative">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-gold text-navy-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow-sm">
                EN ÇOK TERCİH EDİLEN
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-white mb-2">Profesyonel Salon</h3>
            <p className="text-[14px] text-gray-300 mb-6">Büyümek isteyen tam teşekküllü salonlar için.</p>
            
            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold text-white">₺399</span>
              <span className="text-gray-400 font-medium">/ ay</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                'Sınırsız Randevu',
                'Özel Domain (sizin-siteniz.com)',
                'Sınırsız Personel ve Prim Takibi',
                'Gelişmiş Ciro ve Finans Raporları',
                'Otomatik WhatsApp Hatırlatmaları',
                'SMS Kampanya Modülü'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded bg-gold/20 p-0.5">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span className="text-[14px] font-medium text-white">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="w-full py-3.5 text-center bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold rounded-lg transition-opacity hover:opacity-90 text-[14px] shadow-sm"
            >
              14 Gün Ücretsiz Dene
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
