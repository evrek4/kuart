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
    <div className="min-h-screen bg-[#07010e] text-[#eadef7] font-sans relative overflow-x-hidden pb-20 flex flex-col items-center">
      {/* Background Glows */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#ec4899]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-200px] w-[600px] h-[600px] rounded-full bg-[#8b5cf6]/10 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-6xl px-6 py-6 flex justify-between items-center border-b border-white/10 z-10">
        <Link href="/" className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400 uppercase">
          KUAFOR.ART
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="text-xs font-bold text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-full border border-white/10 bg-white/5">
            Yönetici Girişi
          </Link>
        </div>
      </header>

      {/* Main Title Section */}
      <section className="text-center mt-16 px-6 max-w-2xl z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase"
        >
          SALONUNUZ İÇİN <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400">
            EN UYGUN PAKET
          </span>
        </motion.h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-4 leading-relaxed">
          Kuafor.art ile randevularınızı otomatikleştirin, SMS/WhatsApp hatırlatmaları gönderin, temassız POS ödemesi tahsil edin ve premium web vitrininizle fark yaratın.
        </p>
      </section>

      {/* Plans List */}
      <section className="w-full max-w-5xl px-6 mt-16 z-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-gray-400 italic">
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
                className={`p-8 rounded-[2.5rem] border bg-[#120822]/80 backdrop-blur-xl flex flex-col justify-between gap-8 relative shadow-xl hover:border-pink-500/40 transition-all duration-300 ${
                  !plan.isFree ? "border-[#a78bfa]/20 shadow-purple-500/5" : "border-gray-800"
                }`}
              >
                {/* Visual Glow for paid packages */}
                {!plan.isFree && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                    POPÜLER
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                  </div>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-black text-white">{plan.price} TL</span>
                    <span className="text-xs text-gray-500 font-bold ml-2">/ ay</span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    {plan.isFree
                      ? "Gelişmiş özelliklerden mahrum, temel kullanım paketi."
                      : `${plan.name} ile salonunuzun verimliliğini maksimuma taşıyın.`}
                  </p>

                  <ul className="space-y-4 mt-8 border-t border-white/5 pt-6 text-xs text-gray-300 font-semibold">
                    <li className="flex items-center gap-3">
                      <span className="text-pink-500 text-sm">⚡</span>
                      <span><b>{plan.storageLimitMB} MB</b> R2 Medya Kotası</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.smsEnabled ? "text-green-400" : "text-gray-600"}>
                        {plan.features.smsEnabled ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.smsEnabled ? "text-white" : "text-gray-600"}>SMS Hatırlatmaları</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.whatsappEnabled ? "text-green-400" : "text-gray-600"}>
                        {plan.features.whatsappEnabled ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.whatsappEnabled ? "text-white" : "text-gray-600"}>WhatsApp Bildirimleri</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.customDomainAllowed ? "text-green-400" : "text-gray-600"}>
                        {plan.features.customDomainAllowed ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.customDomainAllowed ? "text-white" : "text-gray-600"}>Özel Alan Adı Eşleme</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className={plan.features.customPOSAllowed ? "text-green-400" : "text-gray-600"}>
                        {plan.features.customPOSAllowed ? "✓" : "✕"}
                      </span>
                      <span className={plan.features.customPOSAllowed ? "text-white" : "text-gray-600"}>Özel Sanal POS Tanımlama</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`w-full py-4 rounded-2xl text-center text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                    plan.isFree
                      ? "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                      : "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:brightness-110"
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
