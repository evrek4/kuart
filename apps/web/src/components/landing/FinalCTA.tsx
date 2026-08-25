'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Scissors } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-navy-950 text-white relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gold text-navy-950 mx-auto flex items-center justify-center font-bold shadow-lg">
          <Scissors className="w-6 h-6" />
        </div>

        <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Salonunuzu Yönetmek İçin <br />
          <span className="italic text-gold font-normal">Daha Akıllı Bir Yol Var.</span>
        </h2>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-normal">
          Randevularınızı, müşterilerinizi ve salonunuzu tek yerden yönetin. Kurulum sadece 2 dakikanızı alır.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 bg-gold hover:bg-gold-400 text-navy-950 font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95"
          >
            <span>Ücretsiz Başla</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/15 font-semibold text-base rounded-2xl transition-colors"
          >
            <span>Giriş Yap</span>
          </Link>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kredi kartı gerekmez
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saniyeler içinde kurulum
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> İstediğiniz zaman iptal imkanı
          </span>
        </div>
      </div>
    </section>
  );
}
