'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Smartphone,
  Gift,
  CreditCard,
  Globe,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Zap,
  BarChart3,
  Award,
  Crown,
  ChevronDown,
  Phone,
  Mail,
  HelpCircle,
  Layers,
  MessageSquare,
  FileText,
  Percent,
  CheckCheck,
  ExternalLink
} from 'lucide-react';

export default function LandingPageV1() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Kullanmaya başlamak için teknik veya yazılım bilgisi gerekiyor mu?",
      answer: "Kesinlikle hayır! Kuaför.art, hiçbir teknik bilgiye ihtiyaç duymadan dakikalar içinde kullanabileceğiniz şekilde tasarlandı. Salon adınızı, hizmetlerinizi ve çalışanlarınızı eklemeniz yeterlidir. Sisteme kayıt olmak yalnızca 2 dakikanızı alır."
    },
    {
      question: "WhatsApp otomatik randevu onay mekanizması nasıl çalışır?",
      answer: "Müşteriniz randevu aldığında veya randevu saatinden önce (örneğin 3 saat kala) sistem müşterinize otomatik bir WhatsApp onay mesajı gönderir. Müşteri 'Geleceğim' veya 'İptal' butonuna bastığında takviminiz otomatik güncellenir. Böylece boş koltuk ve no-show derdiniz tamamen biter."
    },
    {
      question: "Kendi özel alan adımı (örn: salonadi.com) bağlayabilir miyim?",
      answer: "Evet! Elite paketimizde salonunuzun kendi alan adını (www.salonunuz.com) sisteme tek tıkla bağlayabilirsiniz. Müşterileriniz doğrudan kendi markanızın adresinden 7/24 randevu oluşturabilir."
    },
    {
      question: "Personel prim ve adisyon takibi nasıl yapılıyor?",
      answer: "Hizmet tamamlandığında tek tıkla adisyonu kapatabilir, ödemeyi nakit veya kart olarak kaydedebilirsiniz. Sistemde tanımladığınız personel prim oranlarına (%20, %30 vb.) göre ay sonunda her ustanın ve asistanın hak edişi kuruşu kuruşuna otomatik hesaplanır."
    },
    {
      question: "İstediğim zaman paket değiştirebilir veya iptal edebilir miyim?",
      answer: "Evet, hiçbir taahhüt veya sözleşme zorunluluğu yoktur. İstediğiniz an paketinizi yükseltebilir, düşürebilir veya tek tıkla aboneliğinizi sonlandırabilirsiniz."
    }
  ];

  const testimonials = [
    {
      name: "Ahmet Kaya",
      role: "Kurucu & Baş Stilist",
      salon: "Nişantaşı Hair Studio",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      comment: "No-show oranımız %22'den sıfıra indi! WhatsApp asistanı tek başına salonun aylık cirosuna en az 40.000 TL katkı sağlıyor. Randevu çakışması veya unutulan müşteri derdimiz bitti.",
      rating: 5
    },
    {
      name: "Selin Demir",
      role: "Salon Sahibi",
      salon: "Levent Beauty & Spa Lounge",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      comment: "Personel primlerini hesaplamak her ay sonu 2 günümü alıyordu. Kuaför.art ile tek tıkla kim ne kadar ciro yapmış ve prim kazanmış döküm alıyorum. İnanılmaz bir rahatlık!",
      rating: 5
    },
    {
      name: "Caner Yılmaz",
      role: "Master Barber",
      salon: "Moda Men's Club",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      comment: "Müşterilerim gece 01:00'de bile sitemizden randevu oluşturuyor. Sabah uyandığımda günün tüm saatlerinin dolduğunu görmek harika. Prestijli vitrin temaları da müşterilerimi çok etkiledi.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* ─── NAVIGATION BAR ────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[14px] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-purple-600 dark:text-purple-400 transform -rotate-45" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-gray-950 dark:text-white flex items-center gap-1.5">
                  Kuaför<span className="text-purple-600 dark:text-purple-400">.art</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                </span>
                <span className="text-[10px] tracking-widest text-gray-600 dark:text-gray-400 font-semibold uppercase">Salon & Spa SaaS</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-purple-600 dark:hover:text-white transition-colors">Özellikler</a>
              <a href="#benefits" className="hover:text-purple-600 dark:hover:text-white transition-colors">Faydalar</a>
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

            {/* Mobile Menu Button */}
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
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                Faydalar
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

      {/* ─── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-gradient-to-tr from-purple-600/15 via-indigo-500/10 to-amber-400/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs sm:text-sm font-bold mb-6 shadow-sm shadow-purple-500/5 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Kuaför ve Güzellik Salonları İçin Yeni Nesil Yönetim Platformu</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15] mb-6"
            >
              Salonunuzu Yönetmenin En Akıllı ve{' '}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                Prestijli Yolu
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mb-10"
            >
              Randevularınızı otomatikleştirin, gelmeyen müşterileri (no-show) sıfırlayın ve cironuzu artırın. Kuaför ve güzellik salonları için yapay zeka destekli hepsi bir arada yönetim platformu.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-8"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Hemen Ücretsiz Başla</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-gray-800 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Paketleri İncele</span>
              </a>
            </motion.div>

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

          {/* Hero interactive mockup */}
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
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-black text-white">18 Randevu</div>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1">Doluluk Oranı: %100 (Koltuklar Dolu)</p>
                  </div>

                  <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">No-Show Engelleme</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-400">%0 Boş Koltuk</div>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1">WhatsApp 2 Yönlü Teyit Aktif</p>
                  </div>

                  <div className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Aylık Net Ciro</span>
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400">+₺78.450</div>
                    <p className="text-[11px] text-purple-300 font-semibold mt-1">Otomatik Pazarlama ile +%38 Artış</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Smartphone className="w-4 h-4" />
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
                      <Gift className="w-4 h-4" />
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

      {/* ─── STATS & SOCIAL PROOF STRIP ─────────────────────────── */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">500+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">Aktif Kuaför & Güzellik Salonu</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-mono">50.000+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">Tamamlanan Randevu</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">%0</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">No-Show Oranı (WhatsApp ile)</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-mono">%99.8</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">Kuaför Memnuniyet Skoru</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES & BENEFITS ─────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
              KUAFÖRE NE KAZANDIRACAK?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3 mb-4">
              Salonunuzun Sorunlarına Nokta Atışı Çözümler
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Teknik karmaşayı bir kenara bırakın. Kuaför.art, her gün karşılaştığınız en büyük operasyonel zorlukları kökünden çözer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                  <Smartphone className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">0 Boş Koltuk</span>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mt-1 mb-3">
                  📱 No-Show&apos;a Son (Akıllı WhatsApp Asistanı)
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  Müşterilerinize randevudan önce otomatik hatırlatma gider. &quot;Geleceğim&quot; veya &quot;Gelmeyeceğim&quot; yanıtlarına göre takviminiz otomatik güncellenir, boş koltuk derdiniz biter.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>2 yönlü otomatik onay ve iptal algılama</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>İptal olan koltuğu anında yedek müşteriye önerme</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-6">
                  <Gift className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Otomatik Ciro Büyümesi</span>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mt-1 mb-3">
                  🎁 Sadık Müşteriler (Otomatik Pazarlama)
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  35 gündür gelmeyen müşterilerinize &quot;Özlettiniz&quot; mesajı atar, doğum günlerinde otomatik indirim sunar ve dijital damga kartı ile sürekli size gelmelerini sağlar.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Doğum günlerine özel kişiselleştirilmiş kupon hediyesi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-500" />
                  <span>Kayıp müşterileri geri getiren yapay zeka tetikleyicisi</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                  <CreditCard className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Şeffaf Muhasebe</span>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mt-1 mb-3">
                  💳 Kasa ve Personel Yönetimi
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  Randevu bitiminde tek tıkla adisyon kapatın, nakit/kart kasanızı tutun ve personellerinizin prim hak edişlerini ay sonunda otomatik hesaplayın.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>Usta & çalışan bazlı otomatik prim ve ciro raporu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>Gün sonu tek tıkla net kasa dökümü ve PDF fiş üretimi</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">7/24 Kesintisiz Randevu</span>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mt-1 mb-3">
                  🌐 Prestijli Online Vitrin
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  Kendi alan adınızla (örn: salonadi.com), 7/24 randevu alabileceğiniz premium temalı bir web sitesine dakikalar içinde sahip olun.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-500" />
                  <span>Luxury Gold ve Modern Dark vitrin temaları</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-500" />
                  <span>Instagram profilinizden tek tıkla randevu alma linki</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
              KOLAY VE HIZLI KURULUM
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3">
              3 Adımda Salonunuzu Dijitalleştirin
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Salon Hesabınızı Açın</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                2 dakikada salon adı ve yetkili iletişim bilgilerinizle ücretsiz kaydınızı tamamlayın.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Hizmet & Ekibinizi Tanımlayın</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Saç kesimi, renklendirme vb. hizmetlerinizi fiyatlarıyla ekleyin ve ustalarınızı tanımlayın.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-amber-500/20">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Otomasyonun Keyfini Çıkarın</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Randevularınız otomatik aksın, WhatsApp teyitleri gitsin ve kasanız hiç olmadığı kadar büyüsün.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PACKAGES & PRICING ──────────────────────────────────── */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
              ŞEFFAF VE ESNEK FİYATLAR
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3 mb-4">
              Her Boyuttaki Salon İçin Uygun Paketler
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              İhtiyacınıza en uygun paketi seçin. Kredi kartı olmadan ücretsiz başlayabilir, dilediğinizde yükseltebilirsiniz.
            </p>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* TIER 1: FREE */}
            <div className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-xl shadow-gray-200/40 dark:shadow-none hover:border-purple-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-950 dark:text-white">BAŞLANGIÇ</h3>
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold">
                    Ücretsiz
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Yeni başlayan ve temel ajanda arayan salonlar için.</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-950 dark:text-white">0 ₺</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">/ süresiz</span>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Temel Randevu Takvimi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Müşteri Kayıt Defteri</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Standart Web Vitrini (kuafor.art/salon)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Manuel Kasa & Adisyon Takibi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1 Personel Tanımlama</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>100 MB Medya Depolama</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/register?plan=FREE"
                  className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* TIER 2: PRO */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-purple-900/30 via-gray-900 to-gray-900 dark:from-purple-950/60 dark:via-gray-900 dark:to-gray-950 border-2 border-purple-500 shadow-2xl shadow-purple-500/20 relative flex flex-col justify-between transform lg:-translate-y-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>EN ÇOK TERCİH EDİLEN</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-extrabold text-white">PRO</h3>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                    Otomasyon Gücü
                  </span>
                </div>
                <p className="text-xs text-gray-300 mb-6">İşini büyütmek, personellerini yönetmek ve otomatikleştirmek isteyenler için.</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-white">
                    {isAnnual ? '399 ₺' : '499 ₺'}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">/ ay {isAnnual && '(Yıllık)'}</span>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm font-medium text-gray-200">
                  <div className="flex items-center gap-2.5 font-bold text-purple-300">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Başlangıç paketindeki her şey dahil</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>📱 <strong>WhatsApp Otomatik Hatırlatıcı</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>🎁 <strong>Dijital Sadakat & Damga Sistemi</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>👥 <strong>Personel Prim & Hak Ediş Modülü</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>🎨 <strong>Premium Portal & Dark Temalar</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sınırsız Personel Ekleme</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>500 MB Medya Depolama Alanı</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Öncelikli WhatsApp Desteği</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <Link
                  href="/register?plan=PRO"
                  className="w-full py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Pro Paketi Seçin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* TIER 3: ELITE */}
            <div className="rounded-3xl p-8 bg-white dark:bg-gray-900 border border-amber-500/40 dark:border-amber-500/30 flex flex-col justify-between shadow-xl shadow-amber-500/5 dark:shadow-none hover:border-amber-500 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                    <span>ELITE</span>
                    <Crown className="w-5 h-5 text-amber-500" />
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                    VIP & Prestij
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Sınırları kaldırmak ve markasını büyütmek isteyen prestijli salonlar için.</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-950 dark:text-white">
                    {isAnnual ? '799 ₺' : '999 ₺'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">/ ay {isAnnual && '(Yıllık)'}</span>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2.5 font-bold text-amber-600 dark:text-amber-400">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Pro paketindeki tüm özellikler dahil</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>🌐 <strong>Özel Alan Adı (salonadi.com)</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>💳 <strong>Kendi Sanal POS&apos;unu Bağlama</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>🚀 <strong>Sınırsız Bildirim & Pazarlama</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>📑 Gelişmiş PDF Raporlama & Muhasebe</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>🎟️ İndirim Kupon & Promosyon Motoru</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>☁️ 10 GB Yüksek Hızlı Bulut Depolama</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>👑 7/24 Birebir VIP Özel Danışman</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/register?plan=ELITE"
                  className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-gray-950 dark:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Elite VIP Pakete Geç</span>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/40 border-y border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
              GÜVENEN SALONLAR
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3">
              Kuaförler Ne Diyor?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg shadow-gray-200/50 dark:shadow-none"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-6">
                    &quot;{t.comment}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-sm">
                    {t.name.charAt(0)}
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

      {/* ─── FAQ ACCORDION ───────────────────────────────────────── */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-purple-600 dark:text-purple-400 uppercase flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>SIKÇA SORULAN SORULAR</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight mt-3">
              Aklınıza Takılan Her Şey
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
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

      {/* ─── BIG CTA BANNER ──────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-purple-900 via-indigo-950 to-gray-950 text-white relative overflow-hidden border border-purple-500/30 shadow-2xl flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
              <Scissors className="w-7 h-7 text-amber-400 transform -rotate-45" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mb-4">
              Salonunuzu Geleceğe Taşımaya Hazır Mısınız?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-xl mb-8 leading-relaxed">
              Hemen bugün ücretsiz kaydolun, ilk randevularınızı dakikalar içinde almaya başlayın. Kredi kartı gerekmez.
            </p>

            <Link
              href="/register"
              className="px-10 py-5 rounded-2xl text-base font-extrabold text-gray-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <span>Hemen Ücretsiz Hesabınızı Açın</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Scissors className="w-4 h-4 transform -rotate-45" />
                </div>
                <span className="font-extrabold text-lg text-white">
                  Kuaför<span className="text-purple-400">.art</span>
                </span>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed">
                Kuaför ve güzellik salonları için yapay zeka destekli yeni nesil randevu ve işletme yönetim platformu.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Ürün</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Faydalar</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Nasıl Çalışır?</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-4">Kurumsal</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="/login" className="hover:text-white transition-colors">Yönetim Paneli Girişi</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Yeni Salon Kaydı</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</a></li>
                <li><a href="mailto:destek@kuafor.art" className="hover:text-white transition-colors">Destek & İletişim</a></li>
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
            <p>© {new Date().getFullYear()} Kuaför.art. Tüm hakları saklıdır.</p>
            <p className="flex items-center gap-1">
              <span>Güzellik ve kuaför ustaları için özenle geliştirildi.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
