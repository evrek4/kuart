'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function WhatsAppChat() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 bg-white dark:bg-[#09090b] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">Boş kalan koltuk, kaybedilen paradır.</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Akıllı hatırlatma sistemi ile müşterilerinize randevularından 1 gün önce WhatsApp üzerinden otomatik mesaj gönderilir. İptaller anında boşa çıkar, yeni müşterilere yer açılır.
          </p>
          <ul className="space-y-4">
            {['Otomatik WhatsApp Entegrasyonu', 'Tek tuşla randevu onayı/iptali', 'No-show oranlarında %80 düşüş'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">✓</div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="relative mx-auto w-full max-w-[320px]">
          {/* Phone Mockup */}
          <div className="relative rounded-[3rem] border-[8px] border-gray-900 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 h-[600px] shadow-2xl overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
              <div className="w-24 h-6 bg-gray-900 rounded-b-3xl"></div>
            </div>
            
            {/* Chat UI */}
            <div className="p-4 pt-12 h-full flex flex-col bg-[#efeae2] dark:bg-[#0b141a]">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-300/50 dark:border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">KA</div>
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">KuaforArt Asistan</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Kurumsal Hesap</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 py-4 space-y-4 flex flex-col">
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-[#202c33] p-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm self-start text-sm text-gray-900 dark:text-white"
                >
                  <p>Merhaba Merve Hanım, yarın 10:30'da <strong>KuaforArt</strong> salonunda randevunuz bulunmaktadır. Geleceğinizi onaylamak için LÜTFEN bu mesaja cevap verin.</p>
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 py-1.5 bg-gray-100 dark:bg-[#374248] rounded text-emerald-600 dark:text-emerald-400 font-bold text-xs">Evet, Geleceğim</button>
                    <button className="flex-1 py-1.5 bg-gray-100 dark:bg-[#374248] rounded text-red-500 dark:text-red-400 font-bold text-xs">İptal Et</button>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block text-right mt-1">14:30</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 2 }}
                  className="bg-[#d9fdd3] dark:bg-[#005c4b] p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm self-end text-sm text-gray-900 dark:text-white"
                >
                  <p>Evet, geleceğim.</p>
                  <span className="text-[10px] text-emerald-700/60 dark:text-white/50 block text-right mt-1">14:35 ✓✓</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 3 }}
                  className="bg-white dark:bg-[#202c33] p-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm self-start text-sm text-gray-900 dark:text-white"
                >
                  <p>Harika! Randevunuz <strong>ONAYLANDI</strong> olarak işaretlendi. Sizi bekliyoruz ✨</p>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block text-right mt-1">14:35</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
