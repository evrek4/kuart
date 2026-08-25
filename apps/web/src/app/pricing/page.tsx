"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  storageLimitMB: number;
  features: {
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    customDomainAllowed?: boolean;
    customPOSAllowed?: boolean;
  };
  isFree: boolean;
  isActive: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("http://localhost:3001/api/admin/plans");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            // Only list active plans
            const activePlans = (json.data || []).filter((p: SubscriptionPlan) => p.isActive !== false);
            setPlans(activePlans);
          }
        }
      } catch (err) {
        console.error("Failed to fetch active plans:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#081326] text-lightText-primary dark:text-darkText-primary font-sans relative overflow-x-hidden pb-20 flex flex-col items-center transition-colors">
      {/* Navigation Header */}
      <header className="w-full max-w-6xl px-6 py-6 flex justify-between items-center border-b border-borderlight dark:border-dark-border z-10">
        <Link href="/" className="text-xl font-black tracking-tighter text-[#0B1933] dark:text-[#F7F8FA] uppercase">
          KUAFOR.ART
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-xs font-bold text-[#0B1933] dark:text-[#F7F8FA] hover:opacity-80 transition-opacity py-2 px-4 rounded-full border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E]">
            Yönetici Girişi
          </Link>
        </div>
      </header>

      {/* Main Title Section */}
      <section className="text-center mt-16 px-6 max-w-2xl z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black tracking-tight text-[#0B1933] dark:text-[#F7F8FA] uppercase"
        >
          SALONUNUZ İÇİN <br />
          <span className="text-lightText-secondary dark:text-darkText-secondary">
            EN UYGUN PAKET
          </span>
        </motion.h1>
        <p className="text-xs sm:text-sm text-lightText-secondary dark:text-darkText-secondary mt-4 leading-relaxed">
          Kuafor.art ile randevularınızı otomatikleştirin, SMS/WhatsApp hatırlatmaları gönderin, temassız POS ödemesi tahsil edin ve premium web vitrininizle fark yaratın.
        </p>
      </section>

      {/* Plans List */}
      <section className="w-full max-w-5xl px-6 mt-16 z-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="w-10 h-10 border-4 border-[#0B1933] dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-lightText-secondary dark:text-darkText-secondary italic">
            Şu anda aktif üyelik paketi bulunmamaktadır. Lütfen daha sonra tekrar kontrol ediniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-8 rounded-3xl border bg-white dark:bg-[#0A111E] flex flex-col justify-between gap-8 relative shadow-sm hover:shadow-md transition-all duration-300 ${
                  !plan.isFree ? "border-borderlight dark:border-dark-border hover:border-[#0B1933] dark:hover:border-white" : "border-borderlight dark:border-dark-border"
                }`}
              >
                {/* Visual Glow for paid packages */}
                {!plan.isFree && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                    POPÜLER
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-[#0B1933] dark:text-[#F7F8FA]">{plan.name}</h3>
                  </div>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-black text-[#0B1933] dark:text-[#F7F8FA]">{plan.price} TL</span>
                    <span className="text-xs text-lightText-secondary dark:text-darkText-secondary font-bold ml-2">/ ay</span>
                  </div>

                  <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-2 font-medium">
                    {plan.isFree
                      ? "Gelişmiş özelliklerden mahrum, temel kullanım paketi."
                      : `${plan.name} ile salonunuzun verimliliğini maksimuma taşıyın.`}
                  </p>

                  <ul className="space-y-4 mt-8 border-t border-borderlight dark:border-dark-border pt-6 text-xs text-lightText-primary dark:text-darkText-primary font-semibold">
                    <li className="flex items-center gap-3">
                      <span className="text-[#0B1933] dark:text-white text-sm">✓</span>
                      <span><b>{plan.storageLimitMB} MB</b> R2 Medya Kotası</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.smsEnabled ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}>
                        {plan.features.smsEnabled ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.smsEnabled ? "text-lightText-primary dark:text-darkText-primary" : "text-gray-400 dark:text-gray-600"}>SMS Hatırlatmaları</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.whatsappEnabled ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}>
                        {plan.features.whatsappEnabled ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.whatsappEnabled ? "text-lightText-primary dark:text-darkText-primary" : "text-gray-400 dark:text-gray-600"}>WhatsApp Bildirimleri</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.customDomainAllowed ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}>
                        {plan.features.customDomainAllowed ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.customDomainAllowed ? "text-lightText-primary dark:text-darkText-primary" : "text-gray-400 dark:text-gray-600"}>Özel Alan Adı Eşleme</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.customPOSAllowed ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}>
                        {plan.features.customPOSAllowed ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.customPOSAllowed ? "text-lightText-primary dark:text-darkText-primary" : "text-gray-400 dark:text-gray-600"}>Özel Sanal POS Tanımlama</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`w-full py-4 rounded-2xl text-center text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                    plan.isFree
                      ? "bg-gray-50 dark:bg-white/5 border border-borderlight dark:border-white/10 text-lightText-secondary dark:text-darkText-secondary hover:bg-gray-100 dark:hover:bg-white/10"
                      : "bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] shadow-lg hover:opacity-90"
                  }`}
                >
                  {plan.isFree ? "Ücretsiz Başla" : "Satın Al & Kurulum Yap"}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Info */}
      <footer className="mt-24 text-center text-xs text-gray-500 font-medium">
        © 2026 Kuafor.art SaaS Platformu. Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
