'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function OnlineStorefront() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-32 bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Online Vitrininiz</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
          Müşterileriniz 7/24 online randevu alabilsin. Kurulum gerektirmeyen, size özel, SEO uyumlu modern bir web sitesi.
        </p>

        <motion.div 
          style={{ y, opacity }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Browser Window Mockup */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-2xl overflow-hidden">
            {/* Browser Header */}
            <div className="h-12 bg-gray-100 dark:bg-[#111] border-b border-gray-200 dark:border-white/5 flex items-center px-4 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-md px-4 py-1 text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-xs">🔒</span>
                  <span className="font-medium text-gray-900 dark:text-gray-300">kuafor.art/merve</span>
                </div>
              </div>
            </div>

            {/* Browser Content (Salon Site Preview) */}
            <div className="relative h-[400px] bg-white dark:bg-[#09090b] text-left">
              {/* Fake cursor */}
              <motion.div 
                animate={{ 
                  x: [0, 100, 250, 250], 
                  y: [0, 50, -20, -20] 
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute z-50 pointer-events-none"
                style={{ top: '200px', left: '100px' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 3.21V20.8C5.5 21.45 6.27 21.79 6.75 21.36L11.44 17.15H17.5C18.05 17.15 18.5 16.7 18.5 16.15V4.21C18.5 3.66 18.05 3.21 17.5 3.21H5.5Z" fill="white" stroke="black" strokeWidth="1.5" />
                </svg>
              </motion.div>

              <div className="p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">Merve Hair Studio</h1>
                  <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <span>Hizmetler</span>
                    <span>Ekibimiz</span>
                    <span>İletişim</span>
                  </nav>
                </div>
                
                <div className="max-w-md">
                  <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Saçınıza Hak Ettiği Değeri Verin.</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">Profesyonel kesim, renklendirme ve bakım hizmetleriyle kendinizi şımartın.</p>
                  
                  {/* Fake Button that the cursor "clicks" */}
                  <motion.button 
                    animate={{ scale: [1, 1, 0.95, 1], backgroundColor: ["#4f46e5", "#4f46e5", "#4338ca", "#4f46e5"] }}
                    transition={{ repeat: Infinity, duration: 4, times: [0, 0.7, 0.8, 1] }}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
                  >
                    Hemen Randevu Al
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

