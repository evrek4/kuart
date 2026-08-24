'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

export default function Hero({ cmsData }: { cmsData: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Magnetic effect & 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-500, 500], [5, -5]);
  const rotateY = useTransform(x, [-500, 500], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Living UI Animation State
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden perspective-1000"
    >
      {/* Background Gradients (Subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
      
      <div className="z-10 max-w-5xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Yeni Nesil Salon İşletim Sistemi
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            {cmsData?.heroTitle || 'Salonunuzun Dijital İşletim Sistemi.'}
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            {cmsData?.heroDescription || 'Randevulardan kasaya, müşteri sadakatinden pazarlamaya kadar her şey tek ekranda, parmaklarınızın ucunda.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href={cmsData?.ctaLink || '/register'} className="relative group inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <button className="relative px-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-2xl transform transition-transform active:scale-95">
              {cmsData?.ctaText || 'Hemen Başla'}
            </button>
          </a>
        </motion.div>
      </div>

      {/* Living Product UI */}
      <motion.div 
        style={{ rotateX, rotateY }}
        className="mt-20 w-full max-w-4xl relative z-20 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden"
      >
        {/* Fake Mac Header */}
        <div className="h-10 border-b border-gray-200 dark:border-white/10 flex items-center px-4 gap-2 bg-gray-50/50 dark:bg-[#111]">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        
        {/* UI Content */}
        <div className="p-8 grid grid-cols-12 gap-8 h-[400px]">
          {/* Sidebar */}
          <div className="col-span-3 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-white/5 rounded-lg w-3/4 mb-8" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-6 rounded-md ${i === 1 ? 'bg-indigo-500/20 w-full' : 'bg-gray-100 dark:bg-white/5 w-5/6'}`} />
            ))}
          </div>
          
          {/* Main Calendar Area */}
          <div className="col-span-9 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bugün</h3>
              <div className="h-8 w-24 bg-gray-100 dark:bg-white/5 rounded-full" />
            </div>

            {/* Time Grid */}
            <div className="relative border-l border-gray-200 dark:border-white/10 pl-4 space-y-8 mt-4">
              <div className="text-sm text-gray-400 dark:text-gray-500 absolute -left-12 top-0">10:00</div>
              <div className="text-sm text-gray-400 dark:text-gray-500 absolute -left-12 top-[80px]">10:30</div>
              <div className="text-sm text-gray-400 dark:text-gray-500 absolute -left-12 top-[160px]">11:00</div>

              {/* Dynamic Appointment */}
              <motion.div 
                className={`absolute left-4 right-0 p-4 rounded-xl border ${step >= 2 ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} shadow-sm transition-colors duration-500`}
                style={{ top: '60px', height: '90px' }}
                animate={step === 1 ? { scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.2)' } : { scale: 1 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Merve Aydın</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ombre & Kesim</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${step >= 2 ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'}`}>
                    {step >= 2 ? 'ONAYLANDI' : 'BEKLİYOR'}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Floating WhatsApp Notification */}
            <AnimatePresence>
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-[-20px] top-[40px] bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 z-30"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">W</div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Merve Aydın</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Geleceğim, teşekkürler! ✨</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </section>
  );
}
