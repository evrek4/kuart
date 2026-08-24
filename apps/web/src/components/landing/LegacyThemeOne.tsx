'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  ChevronDown,
  ExternalLink,
  Star,
  CheckCheck
} from 'lucide-react';
import { LandingCmsPayload } from '@/lib/cms/types';
import { defaultLandingCmsPayload } from '@/lib/cms/defaults';
import { IconResolver } from '@/components/cms/IconResolver';

export default function LandingPage() {
  const [data, setData] = useState<LandingCmsPayload>(defaultLandingCmsPayload);
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/public/landing')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((err) => {
        console.warn('Using default landing payload:', err);
      });
  }, []);

  const { brand, seo, theme, sections, pricingTiers } = data;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Get active sorted sections
  const activeSections = [...(sections || [])]
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order);

  // Section render helpers
  const renderSection = (section: any) => {
    switch (section.id) {
      case 'hero':
        return (
          <section key="hero" className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-gradient-to-tr from-purple-600/15 via-indigo-500/10 to-amber-400/10 blur-[130px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                {/* Pill Badge */}
                {section.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs sm:text-sm font-bold mb-6 shadow-sm shadow-purple-500/5 backdrop-blur-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>{section.badge}</span>
                  </motion.div>
                )}

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15] mb-6"
                >
                  {section.title || brand.slogan}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mb-10"
                >
                  {section.subtitle || brand.description}
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-8"
                >
                  {section.primaryCta?.isActive !== false && (
                    <Link
                      href={section.primaryCta?.url || '/register'}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <span>{section.primaryCta?.text || 'Hemen Ücretsiz Başla'}</span>
                      <IconResolver name={section.primaryCta?.icon || 'ArrowRight'} className="w-5 h-5" />
                    </Link>
                  )}

                  {section.secondaryCta?.isActive !== false && (
                    <a
                      href={section.secondaryCta?.url || '#pricing'}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-gray-800 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <IconResolver name={section.secondaryCta?.icon || 'Sparkles'} className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>{section.secondaryCta?.text || 'Paketleri İncele'}</span>
                    </a>
                  )}
                </motion.div>

                {/* Trust Micro-badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Kredi Kartı Gerekmez</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>2 Dakikada Kurulum</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>İstediğiniz Zaman İptal</span>
                  </div>
                </motion.div>
              </div>

              {/* Hero Live Mockup Strip */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-16 lg:mt-20 max-w-5xl mx-auto"
              >
                <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent border border-purple-500/20 shadow-2xl backdrop-blur-xl">
                  <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-4 sm:p-8 overflow-hidden relative shadow-inner">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        <span className="text-xs font-mono text-gray-400 ml-2 hidden sm:inline">kuafor.art/melek-hair-studio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Canlı & Aktif Salon
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">Bugünkü Randevular</span>
                          <IconResolver name="Calendar" className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-black text-white">18 Randevu</div>
                        <p className="text-[11px] text-emerald-400 font-semibold mt-1">Doluluk Oranı: %100 (Koltuklar Dolu)</p>
                      </div>

                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">No-Show Engelleme</span>
                          <IconResolver name="ShieldCheck" className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-emerald-400">%0 Boş Koltuk</div>
                        <p className="text-[11px] text-gray-400 font-semibold mt-1">WhatsApp 2 Yönlü Teyit Aktif</p>
                      </div>

                      <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-gray-400 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">Aylık Net Ciro</span>
                          <IconResolver name="TrendingUp" className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-black text-amber-400">+₺78.450</div>
                        <p className="text-[11px] text-purple-300 font-semibold mt-1">Otomatik Pazarlama ile +%38 Artış</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                          <IconResolver name="Smartphone" className="w-4 h-4" />
                          <span>Akıllı WhatsApp Asistanı (Otomatik Onay)</span>
                        </div>
                        <div className="bg-gray-800/90 rounded-xl p-3 text-xs text-gray-200 border border-gray-700 space-y-2">
                          <p className="text-gray-300">
                            💬 <strong className="text-white">Kuaför.art Bot:</strong> &quot;Merhaba Elif Hanım, bugün saat 15:30&apos;daki Saç Kesim & Bakım randevunuzu onaylıyor musunuz?&quot;
                          </p>
                          <div className="flex gap-2 pt-1">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" /> [Evet, Geleceğim]
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-gray-700 text-gray-300 font-bold text-[10px]">
                              [Randevuyu Ertele]
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-950/40 to-gray-900 border border-purple-500/20 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                          <IconResolver name="Gift" className="w-4 h-4" />
                          <span>Otomatik Sadakat & Damga Kartı</span>
                        </div>
                        <div className="bg-gray-800/90 rounded-xl p-3 text-xs text-gray-200 border border-gray-700 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">Zeynep Hanım (VIP Müşteri)</p>
                            <p className="text-gray-400 text-[11px] mt-0.5">35 gün hatırlatması ile geri kazanıldı</p>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black">
                            ⭐ 9 / 10 Damga
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        );

      case 'metrics':
        return (
          <section key="metrics" className="py-12 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {(section.items || []).map((item: any, idx: number) => (
                  <div key={idx}>
                    <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${
                      item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      item.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                      item.color === 'amber' ? 'text-amber-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.value}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'benefits':
        return (
          <section key="benefits" id="features" className="py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                {section.badge && (
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                    {section.badge}
                  </span>
                )}
                <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3 mb-4">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                    {section.subtitle}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(section.items || []).map((b: any) => {
                  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
                    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500' },
                    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500' },
                    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
                    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500' }
                  };
                  const colors = colorMap[b.color] || colorMap.purple;

                  return (
                    <motion.div
                      key={b.id}
                      whileHover={{ y: -4 }}
                      className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between relative overflow-hidden group"
                    >
                      <div>
                        <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} ${colors.text} flex items-center justify-center mb-6`}>
                          <IconResolver name={b.icon} className="w-7 h-7" />
                        </div>
                        {b.badge && (
                          <span className={`text-xs font-black uppercase tracking-wider ${colors.text}`}>
                            {b.badge}
                          </span>
                        )}
                        <h3 className="text-2xl font-bold text-gray-950 dark:text-white mt-1 mb-3">
                          {b.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                          {b.description}
                        </p>
                      </div>

                      {b.bulletPoints && b.bulletPoints.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {b.bulletPoints.map((point: string, pIdx: number) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <Check className={`w-4 h-4 ${colors.text}`} />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'how-it-works':
        return (
          <section key="how-it-works" id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                {section.badge && (
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                    {section.badge}
                  </span>
                )}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(section.items || []).map((step: any, sIdx: number) => (
                  <div key={sIdx} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 relative">
                    <div className={`w-12 h-12 rounded-2xl ${
                      step.color === 'indigo' ? 'bg-indigo-600' :
                      step.color === 'amber' ? 'bg-amber-500' : 'bg-purple-600'
                    } text-white font-black text-lg flex items-center justify-center mb-6 shadow-md`}>
                      {step.stepNumber}
                    </div>
                    <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'pricing':
        return (
          <section key="pricing" id="pricing" className="py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                {section.badge && (
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                    {section.badge}
                  </span>
                )}
                <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3 mb-4">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                    {section.subtitle}
                  </p>
                )}

                {/* Billing Toggle */}
                <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      !isAnnual
                        ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Aylık Ödeme
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      isAnnual
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Yıllık Ödeme</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-gray-950 text-[10px] font-black uppercase">
                      %20 İndirim
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {(pricingTiers || []).filter(p => p.isActive !== false).map((plan) => {
                  const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;

                  if (plan.isPopular) {
                    return (
                      <div
                        key={plan.id}
                        className="rounded-3xl p-8 bg-gradient-to-b from-purple-900/30 via-gray-900 to-gray-900 dark:from-purple-950/60 dark:via-gray-900 dark:to-gray-950 border-2 border-purple-500 shadow-2xl shadow-purple-500/20 relative flex flex-col justify-between transform lg:-translate-y-2"
                      >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{plan.badge || 'EN ÇOK TERCİH EDİLEN'}</span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-extrabold text-white">{plan.name}</h3>
                          </div>
                          <p className="text-xs text-gray-300 mb-6">{plan.description}</p>

                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-black text-white">
                              {price} {plan.currency}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">/ ay {isAnnual && '(Yıllık)'}</span>
                          </div>

                          <div className="space-y-3.5 text-xs sm:text-sm font-medium text-gray-200">
                            {plan.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2.5">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{feat.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-800">
                          <Link
                            href={plan.ctaUrl || `/register?plan=${plan.name}`}
                            className="w-full py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                          >
                            <span>{plan.ctaText || 'Pro Paketi Seçin'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={plan.id}
                      className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-xl shadow-gray-200/40 dark:shadow-none hover:border-purple-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-950 dark:text-white">{plan.name}</h3>
                          {plan.badge && (
                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">{plan.description}</p>
                        <div className="flex items-baseline gap-1 mb-6">
                          <span className="text-4xl font-extrabold text-gray-950 dark:text-white">
                            {price} {plan.currency}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                            {price === 0 ? '/ süresiz' : `/ ay ${isAnnual ? '(Yıllık)' : ''}`}
                          </span>
                        </div>

                        <div className="space-y-3.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          {plan.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2.5">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>{feat.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <Link
                          href={plan.ctaUrl || `/register?plan=${plan.name}`}
                          className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <span>{plan.ctaText || 'Hemen Başla'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section key="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-200 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                {section.badge && (
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                    {section.badge}
                  </span>
                )}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(section.items || []).map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg shadow-gray-200/50 dark:shadow-none"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-amber-400 mb-4">
                        {[...Array(t.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-6">
                        &quot;{t.comment}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-sm">
                        {t.name?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-950 dark:text-white">{t.name}</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{t.salon} • {t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'faq':
        return (
          <section key="faq" id="faq" className="py-20 lg:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                {section.badge && (
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase flex items-center justify-center gap-1.5">
                    <IconResolver name="HelpCircle" className="w-4 h-4" />
                    <span>{section.badge}</span>
                  </span>
                )}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {(section.items || []).filter((f: any) => f.isActive !== false).map((faq: any, idx: number) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={faq.id || idx}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-purple-500 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800/60 pt-4"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'cta-banner':
        return (
          <section key="cta-banner" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-purple-900 via-indigo-950 to-gray-950 text-white relative overflow-hidden border border-purple-500/30 shadow-2xl flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                  <Scissors className="w-7 h-7 text-amber-400 transform -rotate-45" />
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mb-4">
                  {section.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-300 max-w-xl mb-8 leading-relaxed">
                  {section.subtitle}
                </p>

                <Link
                  href={section.primaryCta?.url || '/register'}
                  className="px-10 py-5 rounded-2xl text-base font-extrabold text-gray-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <span>{section.primaryCta?.text || 'Hemen Ücretsiz Hesabınızı Açın'}</span>
                  <IconResolver name={section.primaryCta?.icon || 'ArrowRight'} className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* ─── NAVIGATION BAR (CENTRAL BRAND FROM CMS) ──────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={brand.logoLink || '/'} className="flex items-center gap-3 group">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.brandName}
                  style={{ width: brand.logoWidth || 160, height: brand.logoHeight || 40, objectFit: 'contain' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[14px] flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-purple-600 dark:text-purple-400 transform -rotate-45" />
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-gray-950 dark:text-white flex items-center gap-1.5">
                  {brand.brandName}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                </span>
                <span className="text-[10px] tracking-widest text-gray-600 dark:text-gray-400 font-semibold uppercase">
                  {brand.shortBrandName || 'Salon & Spa SaaS'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-purple-600 dark:hover:text-white transition-colors">Özellikler</a>
              <a href="#how-it-works" className="hover:text-purple-600 dark:hover:text-white transition-colors">Nasıl Çalışır?</a>
              <a href="#pricing" className="hover:text-purple-600 dark:hover:text-white transition-colors">Fiyatlandırma</a>
              <a href="#faq" className="hover:text-purple-600 dark:hover:text-white transition-colors">SSS</a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-white transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-600 shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>Hemen Ücretsiz Başla</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                aria-label="Menüyü Aç"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`h-0.5 w-full bg-current rounded transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`h-0.5 w-full bg-current rounded transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-0.5 w-full bg-current rounded transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 pt-2 pb-6 space-y-3"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Özellikler
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Nasıl Çalışır?
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Fiyatlandırma
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                SSS
              </a>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20"
                >
                  Hemen Ücretsiz Başla
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── DYNAMIC SECTION RENDERING PIPELINE ────────────────── */}
      {activeSections.map((section) => renderSection(section))}

      {/* ─── FOOTER (CENTRAL BRAND FROM CMS) ───────────────────── */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1 space-y-4">
              <Link href={brand.logoLink || '/'} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Scissors className="w-4 h-4 transform -rotate-45" />
                </div>
                <span className="font-extrabold text-lg text-white">
                  {brand.brandName}
                </span>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed">
                {brand.description}
              </p>
              {brand.phone && <p className="text-xs text-gray-300">📞 {brand.phone}</p>}
              {brand.email && <p className="text-xs text-gray-300">✉️ {brand.email}</p>}
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Ürün</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Nasıl Çalışır?</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Kurumsal</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="/login" className="hover:text-white transition-colors">Yönetim Paneli Girişi</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Yeni Salon Kaydı</a></li>
                <li><a href={`mailto:${brand.email}`} className="hover:text-white transition-colors">Destek & İletişim</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Yasal</h4>
              <ul className="space-y-2.5 text-xs">
                <li><span className="text-gray-400 hover:text-white cursor-pointer">Kullanım Şartları</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer">Gizlilik Politikası</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer">KVKK Aydınlatma Metni</span></li>
                <li><span className="text-gray-400 hover:text-white cursor-pointer">Çerez Politikası</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} {brand.brandName}. Tüm hakları saklıdır.</p>
            <p className="flex items-center gap-1">
              <span>Güzellik ve kuaför ustaları için özenle geliştirildi.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
