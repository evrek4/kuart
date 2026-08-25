'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, CheckCircle2, Scissors, Star, MapPin, Phone } from 'lucide-react';

export default function OnlineStorefront() {
  return (
    <section id="website" className="py-24 bg-white dark:bg-[#070D18] border-t border-[#E6E7EA] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold tracking-widest text-gold uppercase">
              PRESTİJLİ DİJİTAL KİMLİK
            </span>

            <h2 className="font-serif text-3xl md:text-5xl font-bold text-navy-900 dark:text-white leading-tight">
              Instagram Profiliniz Var. <br />
              <span className="italic text-gold font-normal">Peki Kendi Salon Web Siteniz?</span>
            </h2>

            <p className="text-navy-800/75 dark:text-gray-300 text-base leading-relaxed">
              Müşterilerinize sadece bir sosyal medya hesabı değil, kendi alan adınızla (`adiniz.kuafor.art`) yayın yapan 7/24 randevu kabul eden profesyonel bir web sitesi sunun.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-900 dark:text-white text-sm block">Özelleştirilebilir Salon Sayfası</span>
                  <span className="text-xs text-navy-800/70 dark:text-gray-400">Salon fotoğraflarınız, çalışma saatleriniz ve konumunuz tek sayfada.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-900 dark:text-white text-sm block">Hizmet Ve Fiyat Listesi</span>
                  <span className="text-xs text-navy-800/70 dark:text-gray-400">Müşterileriniz salona gelmeden önce sunduğunuz hizmetleri ve güncel fiyatları inceler.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-navy-900 dark:text-white text-sm block">Google'da Bulunabilirlik</span>
                  <span className="text-xs text-navy-800/70 dark:text-gray-400">Bölgenizdeki potansiyel müşterilerin sizi internette bulmasını sağlayın.</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-navy-900 text-white dark:bg-gold dark:text-navy-950 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <span>Web Sayfanızı Oluşturun</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Browser Mockup Display */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-borderlight dark:border-white/10 bg-warmbg dark:bg-[#111A2E] shadow-2xl p-6 md:p-8 space-y-6">
              {/* Browser Address Bar Header */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-navy-950 border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-navy-900 dark:text-gold font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>https://artisan.kuafor.art</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  Canlı
                </span>
              </div>

              {/* Mockup Storefront UI */}
              <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-gray-200/80 dark:border-white/5 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-navy-900 text-white dark:bg-gold dark:text-navy-950 flex items-center justify-center font-bold">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Artisan Coiffure</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> 4.9 (128 Değerlendirme)
                        </span>
                        <span>• Nişantaşı, İstanbul</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-4 py-2 bg-navy-900 text-white dark:bg-gold dark:text-navy-950 font-bold text-xs rounded-xl shadow">
                    Randevu Al
                  </button>
                </div>

                {/* Service Cards */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">Popüler Hizmetler</div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-navy-950/40 border border-gray-200/50 dark:border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-navy-900 dark:text-white block">Kadın Saç Kesimi & Fön</span>
                      <span className="text-gray-400 text-[11px]">45 Dakika</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-navy-900 dark:text-gold block">₺650</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Online Randevuya Açık</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-navy-950/40 border border-gray-200/50 dark:border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-navy-900 dark:text-white block">Organik Keratin Bakım</span>
                      <span className="text-gray-400 text-[11px]">90 Dakika</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-navy-900 dark:text-gold block">₺1.850</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Online Randevuya Açık</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
