'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Settings, Share2, CalendarCheck2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Salonunuzu Oluşturun',
    description: 'Ad soyad ve salon adınızla dakikalar içinde hesabınızı açın. Kredi kartı gerekmez.'
  },
  {
    step: '02',
    icon: Settings,
    title: 'Hizmet & Personeli Ekleyin',
    description: 'Verdiğiniz hizmetleri, süreleri, fiyatları ve çalışan ekibinizi sisteme tanımlayın.'
  },
  {
    step: '03',
    icon: Share2,
    title: 'Web Sayfanızı Paylaşın',
    description: 'Size özel oluşturulan adiniz.kuafor.art web linkini Instagram biyografinize ve WhatsApp mesajlarınıza ekleyin.'
  },
  {
    step: '04',
    icon: CalendarCheck2,
    title: 'Randevuları Otomatik Toplayın',
    description: 'Müşterileriniz 7/24 online randevu alsın, bildirimler telefonunuza anında düşsün.'
  }
];

export default function Timeline() {
  return (
    <section id="how-it-works" className="py-24 bg-warmbg dark:bg-dark border-t border-[#E6E7EA] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-widest text-gold uppercase">
            KOLAY ADIMLARLA BAŞLAYIN
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-navy-900 dark:text-white">
            Sadece 4 Adımda <br />
            <span className="italic text-gold font-normal">Salonunuz Dijitalde Yayında.</span>
          </h2>
          <p className="text-base text-navy-800/70 dark:text-gray-400">
            Karmaşık kurulumlar yok. Teknik bilgiye ihtiyaç duymadan dakikalar içinde sisteminizi kurun.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-7 rounded-3xl bg-white dark:bg-navy-900 border border-borderlight dark:border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-extrabold text-gold opacity-90">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-warmbg dark:bg-navy-800 text-navy-900 dark:text-gold flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 font-serif text-xl font-bold text-navy-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-navy-800/75 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-1.5 text-xs font-bold text-navy-900 dark:text-gold">
                  <span>Adım {idx + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="text-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-navy-900 text-white dark:bg-gold dark:text-navy-950 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            <span>Hemen Adım 1'den Başlayın</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
