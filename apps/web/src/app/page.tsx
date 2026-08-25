'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scissors,
  Calendar,
  Sparkles,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  Users,
  CreditCard,
  Building2
} from 'lucide-react';

// Live Countdown Timer logic
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function UnderConstructionPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set target date 14 days from now for countdown demonstration
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setEmail('');
    }, 800);
  };

  const upcomingFeatures = [
    {
      icon: Calendar,
      title: 'Akıllı Online Randevu',
      desc: '7/24 kesintisiz randevu kabulü, WhatsApp & SMS onay mesajları ve otomatik hatırlatmalar.'
    },
    {
      icon: Users,
      title: 'Personel & Prim Yönetimi',
      desc: 'Çalışanlarınızın prim oranlarını, vardiya takvimlerini ve performansını kolayca yönetin.'
    },
    {
      icon: CreditCard,
      title: 'Hızlı Kasa & Stok Takibi',
      desc: 'Hizmet ve ürün satışları, adisyon yönetimi ve detaylı finansal raporlama.'
    },
    {
      icon: Building2,
      title: 'Salonunuza Özel Web Sitesi',
      desc: 'Markanıza özel SEO uyumlu online randevu vitrini ve hizmet listesi.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070C14] text-slate-100 font-sans selection:bg-[#D4AF37]/30 relative overflow-hidden flex flex-col justify-between">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Top Header / Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#B8860B] p-[1px] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B132B] rounded-[15px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-300">
              Kuaför<span className="text-[#D4AF37]">.art</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-amber-300/60 font-semibold">
              Salon Yönetim Platformu
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-medium text-amber-300">Sürüm 2.0 Hazırlanıyor</span>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm font-medium text-slate-300">
            Yenilenen Altyapımızla Çok Yakında Sizlerleyiz
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]"
        >
          Salonunuzu Dijital Çağa Taşıyacak{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA771C]">
            Yeni Nesil Platform
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed"
        >
          Kuaför.art platformunu daha hızlı, güvenli ve kapsamlı özelliklerle yeniden tasarlıyoruz. 
          Çok kısa bir süre içinde tüm salon yöneticilerine ve müşterilerine kapılarımızı açacağız.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 grid grid-cols-4 gap-3 sm:gap-6 max-w-xl w-full"
        >
          {[
            { label: 'Gün', value: timeLeft.days },
            { label: 'Saat', value: timeLeft.hours },
            { label: 'Dakika', value: timeLeft.minutes },
            { label: 'Saniye', value: timeLeft.seconds }
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl relative group hover:border-[#D4AF37]/40 transition-all duration-300"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300 tracking-tight">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-amber-300/70 font-semibold mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Email Notification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 w-full max-w-md"
        >
          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Kaydınız alındı! Yayınlandığımız an size özel erişim linki göndereceğiz.
              </span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz..."
                  required
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm backdrop-blur-md"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#AA771C] hover:from-[#E5C158] hover:to-[#B8860B] text-slate-950 font-bold text-sm shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Haber Ver</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
          <p className="text-xs text-slate-500 mt-3">
            Spam göndermeyiz. Yalnızca platform açılışı ve erken erişim daveti için kullanılacaktır.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left"
        >
          {upcomingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-[#D4AF37]/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>© 2026 Kuaför.art — Tüm hakları saklıdır.</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <a
            href="mailto:info@kuafor.art"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>info@kuafor.art</span>
          </a>
          <a
            href="https://wa.me/905000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Destek</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
