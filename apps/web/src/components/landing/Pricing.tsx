'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { MASTER_FEATURES } from '@/lib/constants/features';

export default function Pricing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/plans')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlans(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="py-32 bg-white dark:bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">Size Uygun Planı Seçin</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Küçük salonlardan zincir işletmelere kadar her ihtiyaca uygun esnek fiyatlandırma.
          </p>
          
          <div className="inline-flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setBilling('MONTHLY')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${billing === 'MONTHLY' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Aylık
            </button>
            <button 
              onClick={() => setBilling('YEARLY')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${billing === 'YEARLY' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Yıllık (%20 İndirim)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => {
            const isPopular = plan.name === 'PRO';
            const price = billing === 'MONTHLY' ? plan.price : (plan.price * 0.8).toFixed(0);

            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-8 rounded-3xl border ${isPopular ? 'bg-gray-900 text-white border-gray-800 shadow-2xl scale-105' : 'bg-white dark:bg-[#111] border-gray-200 dark:border-white/5 text-gray-900 dark:text-white shadow-md dark:shadow-none'}`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">EN POPÜLER</span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">₺{price}</span>
                  <span className="text-sm opacity-60">/ ay</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.maxAppointments && (
                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isPopular ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                        📅
                      </div>
                      <span>Max {plan.maxAppointments} Randevu/Ay</span>
                    </li>
                  )}
                  {plan.maxStaff && (
                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-white">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isPopular ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        👥
                      </div>
                      <span>Max {plan.maxStaff} Personel</span>
                    </li>
                  )}
                  {MASTER_FEATURES
                    .filter(feat => Array.isArray(plan.features) && plan.features.includes(feat.id))
                    .map(feat => (
                      <li key={feat.id} className="flex items-center gap-3 text-sm font-medium">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isPopular ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'}`}>
                          ✓
                        </div>
                        <span>{feat.label}</span>
                      </li>
                    ))}
                </ul>


                <a href={`/register?plan=${plan.id}`} className="block w-full">
                  <button className={`w-full py-3 rounded-xl font-bold transition-transform hover:scale-105 ${isPopular ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'}`}>
                    {plan.isFree ? 'Ücretsiz Başla' : 'Planı Seç'}
                  </button>
                </a>
              </motion.div>


            );
          })}
        </div>

        {/* Promo Code Tooltip Info */}
        <div className="mt-16 text-center group relative inline-block mx-auto w-full">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-help flex items-center justify-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs">i</span>
            Kupon kodunuz mu var?
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none">
            "LANSMAN50" gibi indirim kuponlarınızı ödeme adımında uygulayabilir, anında indirimin keyfini çıkarabilirsiniz!
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>
    </section>
  );
}

