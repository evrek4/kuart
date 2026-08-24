'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

export default function Loyalty() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [days, setDays] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timer = setInterval(() => {
        setDays(prev => {
          if (prev < 35) return prev + 1;
          clearInterval(timer);
          return 35;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isInView]);

  return (
    <section className="py-32 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 lg:order-1 relative">
          <div ref={ref} className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-white/5 relative z-10">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">Sadakat Kartı (Merve Aydın)</h3>
            
            <div className="flex justify-center gap-3 mb-8">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${i < 4 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600'}`}
                >
                  {i < 4 && <span className="font-bold text-xl">✓</span>}
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 to-pink-500/10 p-6 rounded-2xl border border-amber-500/20 text-center">
              <p className="text-amber-600 dark:text-amber-400 font-bold mb-1">Müşteriniz 35 gündür gelmiyor.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Otomatik %15 indirim kampanyası gönderilsin mi?</p>
              <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform">
                Gönder
              </button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-2xl z-0 rounded-full" />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Müşteriniz sizi unutmasın.</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Gelmesi geciken müşterilerinizi otomatik tespit eden yapay zeka destekli sadakat sistemi. Özel günlerde, doğum günlerinde ve kritik süre (örn: {days} gün) aşıldığında onlara geri dönüş yapmaları için geçerli nedenler sunar.
          </p>
        </div>

      </div>
    </section>
  );
}

