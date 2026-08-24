'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

export default function FinancePanel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let current = 0;
      const target = 18420;
      const step = target / 60; // 60 frames
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setRevenue(target);
          clearInterval(timer);
        } else {
          setRevenue(current);
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView]);

  const formattedRevenue = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(revenue);

  return (
    <section className="py-32 bg-white dark:bg-[#09090b] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Finans ve Kasa Kontrolü</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Personel primleri, masraflar, nakit ve kredi kartı akışı. Her şey otomatik hesaplanır, gün sonu stresine son verilir.
          </p>
        </div>

        <div ref={ref} className="relative">
          <div className="bg-gray-50 dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-2xl dark:shadow-none relative z-10">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Bugünkü Ciro</h3>
            <div className="text-5xl font-black mb-8 text-gray-900 dark:text-white flex items-baseline gap-1">
              <span>₺</span>
              <span>{formattedRevenue}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <span className="font-bold text-gray-700 dark:text-gray-300">Nakit</span>
                <span className="font-bold text-gray-950 dark:text-white">₺8,200</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <span className="font-bold text-gray-700 dark:text-gray-300">Kredi Kartı</span>
                <span className="font-bold text-gray-950 dark:text-white">₺10,220</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 mt-4">
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Personel Primleri</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                    <span>Merve A. (%20)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₺1,240</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
                    <span>Hakan Y. (%15)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₺950</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -inset-10 bg-emerald-500/10 blur-3xl rounded-full z-0 pointer-events-none" />
        </div>

      </div>
    </section>
  );
}

