'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const events = [
  { time: '08:45', title: 'Yeni Randevu Talebi', desc: 'Canan Hanım online vitrinden saç kesimi randevusu oluşturdu.', color: 'bg-blue-500' },
  { time: '09:00', title: 'Mesai Başlangıcı', desc: 'Personel girişleri yapıldı. Günlük plan otomatik SMS ile personele iletildi.', color: 'bg-indigo-500' },
  { time: '11:30', title: 'Ödeme Alındı', desc: 'Ayşe Hanım işlemi tamamlandı. Temassız ödeme başarıyla gerçekleşti.', color: 'bg-emerald-500' },
  { time: '14:00', title: 'Hatırlatma Gönderildi', desc: 'Yarının randevuları için otomatik WhatsApp hatırlatmaları iletildi.', color: 'bg-amber-500' },
  { time: '18:00', title: 'Gün Sonu Raporu', desc: 'Kasa kapandı. Ciro ve personel primleri otomatik hesaplandı.', color: 'bg-purple-500' },
];

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={containerRef} className="py-32 relative bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">Salonunuz Çalışırken...</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Arka planda sizin için tıkır tıkır işleyen bir sistem.</p>
        </div>

        {/* Vertical Line */}
        <div className="absolute left-1/2 top-48 bottom-0 w-px bg-gray-200 dark:bg-white/10 transform -translate-x-1/2 md:block hidden" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="absolute left-1/2 top-48 bottom-0 w-px bg-indigo-500 transform -translate-x-1/2 md:block hidden origin-top"
          style={{ scaleY: scrollYProgress }}
        />

        <div className="space-y-24">
          {events.map((ev, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`w-full md:w-1/2 ${isEven ? 'md:text-left' : 'md:text-right'} p-6 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-white/5`}>
                  <span className="text-sm font-mono font-bold text-indigo-500 mb-2 block">{ev.time}</span>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{ev.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{ev.desc}</p>
                </div>
                
                {/* Node */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-black border-2 border-indigo-500 z-10 items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${ev.color}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

