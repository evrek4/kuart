'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-navy-900 dark:bg-[#060D1A] border-y border-navy-800 dark:border-[#09152B] relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy-800 dark:bg-dark-highlight mb-8 border border-navy-700 dark:border-dark-border">
          <Sparkles className="w-6 h-6 text-gold" />
        </div>

        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          Salonunuzu Dijitale Taşımaya <br className="hidden sm:block" />
          <span className="italic font-normal">Hazır mısınız?</span>
        </h2>
        
        <p className="text-[16px] text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed">
          Türkiye'nin dört bir yanındaki yüzlerce kuaför arasına katılın. Randevularınızı otomatikleştirin, cironuzu artırın. Kredi kartı gerekmeden hemen deneyin.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F7F8FA] text-[#0B1933] font-bold rounded-lg transition-opacity hover:opacity-90 shadow-sm text-[15px]"
          >
            <span>Hemen Ücretsiz Başla</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/905000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-[#F7F8FA] font-semibold rounded-lg transition-opacity hover:opacity-90 text-[15px]"
          >
            Satış Ekibiyle Görüş
          </a>
        </div>
      </div>
    </section>
  );
}
