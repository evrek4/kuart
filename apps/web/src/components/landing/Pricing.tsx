'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-[#070D18] border-t border-[#E6E7EA] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-widest text-gold uppercase">
            ŞEFFAF VESADE FİYATLANDIRMA
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-navy-900 dark:text-white">
            Gizli Ücret Yok. Sürpriz Yok. <br />
            <span className="italic text-gold font-normal">İhtiyacınıza Uygun Planı Seçin.</span>
          </h2>
          <p className="text-base text-navy-800/70 dark:text-gray-400">
            Salonunuzun büyüklüğüne göre ölçeklenen planlar. İstediğiniz zaman iptal edebilir veya paketinizi değiştirebilirsiniz.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Plan 1: Başlangıç (Ücretsiz) */}
          <div className="p-8 md:p-10 rounded-3xl bg-warmbg dark:bg-navy-900 border border-borderlight dark:border-white/10 shadow-lg flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-navy-800/70 dark:text-gray-400 uppercase tracking-wider block">
                  BİREYSEL KUAFÖRLER İÇİN
                </span>
                <h3 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                  Başlangıç Paketi
                </h3>
                <p className="mt-2 text-xs text-navy-800/75 dark:text-gray-400">
                  Yeni başlayan salonlar ve bağımsız kuaförler için temel dijital altyapı.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-extrabold text-navy-900 dark:text-white">₺0</span>
                <span className="text-xs text-gray-500 font-medium">/ sonsuza kadar ücretsiz</span>
              </div>

              <div className="space-y-3 text-xs text-navy-900 dark:text-gray-200 font-medium pt-4 border-t border-gray-200/80 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sınırsız Randevu Kabulü</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Kişisel Salon Web Sayfası (`adiniz.kuafor.art`)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Müşteri Rehberi & İletişim Bilgileri</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Temel Kasa & Gelir Takibi</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1 Personel Hesabı</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full text-center py-4 rounded-2xl border-2 border-navy-900 dark:border-white/20 text-navy-900 dark:text-white font-bold hover:bg-navy-900 hover:text-white dark:hover:bg-white dark:hover:text-navy-950 transition-all text-sm"
            >
              Ücretsiz Başla →
            </Link>
          </div>

          {/* Plan 2: Profesyonel Salon (Öne Çıkarılan Plan) */}
          <div className="p-8 md:p-10 rounded-3xl bg-navy-900 text-white dark:bg-navy-900 border-2 border-gold shadow-2xl flex flex-col justify-between space-y-8 relative overflow-hidden">
            {/* Top Recommended Ribbon Badge */}
            <div className="absolute top-5 right-5 px-3.5 py-1 rounded-full bg-gold text-navy-950 text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>EN ÇOK TERCİH EDİLEN</span>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-wider block">
                  BÜYÜYEN SALONLAR & EKİPLER İÇİN
                </span>
                <h3 className="mt-1 font-serif text-2xl font-bold text-white">
                  Profesyonel Salon Paket
                </h3>
                <p className="mt-2 text-xs text-gray-300">
                  Birden fazla personeli olan, WhatsApp entegrasyonu ve gelişmiş ciro raporları isteyen salonlar.
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-extrabold text-gold">₺499</span>
                <span className="text-xs text-gray-300 font-medium">/ ay</span>
              </div>

              <div className="space-y-3 text-xs text-gray-200 font-medium pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span className="font-bold text-white">Başlangıç paketindeki tüm özellikler</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>Otomatik WhatsApp & SMS Randevu Hatırlatma</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>Sınırsız Personel & Prim Hesaplama</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>Gelişmiş Ciro, Hizmet & Kasa Raporları</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>Müşteri Sadakat & VIP Not Kartları</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>Öncelikli Müşteri Destek Hattı</span>
                </div>
              </div>
            </div>

            <Link
              href="/register"
              className="w-full text-center py-4 rounded-2xl bg-gold hover:bg-gold-400 text-navy-950 font-bold shadow-xl transition-all text-sm"
            >
              14 Gün Ücretsiz Deneyin →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
