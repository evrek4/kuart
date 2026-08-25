'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

export default function OnlineStorefront() {
  return (
    <section className="py-24 bg-warmbg dark:bg-dark-DEFAULT border-y border-borderlight dark:border-dark-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-center">
        
        {/* Left Side: Mockups */}
        <div className="order-2 lg:order-1 relative flex justify-center lg:justify-start mt-10 lg:mt-0">
          <div className="relative w-[280px] h-[580px] rounded-[32px] border-[6px] border-[#F8F9FA] dark:border-[#0A111E] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] bg-white dark:bg-dark-card overflow-hidden">
            {/* Phone Top Bar */}
            <div className="h-6 w-full absolute top-0 left-0 bg-transparent z-20 flex justify-center pt-2">
              <div className="w-20 h-4 bg-black dark:bg-[#0A111E] rounded-full" />
            </div>

            {/* Mobile App UI Simulation */}
            <div className="h-full w-full bg-[#FAFAFA] dark:bg-dark-DEFAULT flex flex-col pt-12 pb-6 px-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 dark:bg-dark-highlight mb-3" />
                <h4 className="font-serif text-lg font-bold text-lightText-primary dark:text-darkText-primary">Artisan Studio</h4>
                <p className="text-[10px] text-lightText-muted dark:text-darkText-muted mt-1">Nişantaşı, İstanbul</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 rounded border border-borderlight dark:border-dark-border bg-white dark:bg-dark-card flex justify-between items-center">
                  <span className="text-xs font-semibold text-lightText-primary dark:text-darkText-primary">Saç Kesimi</span>
                  <span className="text-xs font-bold text-lightText-secondary dark:text-darkText-secondary">₺350</span>
                </div>
                <div className="p-3 rounded border border-borderlight dark:border-dark-border bg-white dark:bg-dark-card flex justify-between items-center">
                  <span className="text-xs font-semibold text-lightText-primary dark:text-darkText-primary">Ombre & Sombre</span>
                  <span className="text-xs font-bold text-lightText-secondary dark:text-darkText-secondary">₺1.800</span>
                </div>
                <div className="p-3 rounded border border-borderlight dark:border-dark-border bg-white dark:bg-dark-card flex justify-between items-center">
                  <span className="text-xs font-semibold text-lightText-primary dark:text-darkText-primary">Keratin Bakım</span>
                  <span className="text-xs font-bold text-lightText-secondary dark:text-darkText-secondary">₺900</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="w-full py-2.5 rounded bg-navy-900 dark:bg-gold text-white dark:text-navy-950 text-xs font-bold text-center">
                  Randevu Al
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle Accent Box (Replaces messy floating items) */}
          <div className="absolute bottom-10 -right-4 md:-right-8 p-4 rounded-xl bg-white dark:bg-dark-highlight border border-borderlight dark:border-dark-border shadow-md">
            <p className="text-[11px] font-bold text-lightText-primary dark:text-darkText-primary mb-1">Yeni Randevu Talebi</p>
            <p className="text-[10px] text-lightText-muted dark:text-darkText-muted mb-2">Ayşe Kaya - Saç Kesimi</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] font-bold">ONAYLA</span>
            </div>
          </div>
        </div>

        {/* Right Side: Copy */}
        <div className="order-1 lg:order-2 space-y-6">
          <span className="inline-block px-3 py-1.5 rounded-lg bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border text-[11px] font-semibold tracking-widest text-lightText-secondary dark:text-darkText-secondary uppercase shadow-sm">
            MARKA KİMLİĞİ
          </span>
          <h2 className="font-serif text-3xl md:text-[2.75rem] font-bold text-lightText-primary dark:text-darkText-primary leading-tight">
            Salonunuz <br />
            Online Dünyada
          </h2>
          <p className="text-[16px] text-lightText-secondary dark:text-darkText-secondary leading-relaxed max-w-lg">
            Sadece bir randevu defteri değil, salonunuza özel tasarlanmış modern bir web sitesi veriyoruz. Instagram hesabınıza ekleyeceğiniz profesyonel link ile müşterilerinizin saniyeler içinde randevu almasını sağlayın.
          </p>

          <ul className="space-y-4 pt-2 pb-6">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[15px] text-lightText-secondary dark:text-darkText-secondary">
                <strong className="text-lightText-primary dark:text-darkText-primary font-semibold">Mobil Uyumlu:</strong> Tüm telefon ve tabletlerde kusursuz görünüm.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[15px] text-lightText-secondary dark:text-darkText-secondary">
                <strong className="text-lightText-primary dark:text-darkText-primary font-semibold">Özel URL:</strong> salonadi.kuafor.art şeklinde profesyonel adres.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[15px] text-lightText-secondary dark:text-darkText-secondary">
                <strong className="text-lightText-primary dark:text-darkText-primary font-semibold">7/24 Açık Dükkan:</strong> Siz uyurken bile randevu kabul etmeye devam edin.
              </span>
            </li>
          </ul>

          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-dark-card border border-borderlight dark:border-dark-border text-lightText-primary dark:text-darkText-primary font-bold rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-[#12233D] shadow-sm text-[14px]"
          >
            Örnek Sayfayı İncele
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
      </div>
    </section>
  );
}
