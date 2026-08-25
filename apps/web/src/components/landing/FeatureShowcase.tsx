'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  ShieldCheck,
  Zap,
  TrendingUp,
  UserCheck,
  Sparkles,
  Scissors,
  CheckCircle,
  Clock,
  Phone
} from 'lucide-react';

export default function FeatureShowcase() {
  return (
    <section id="features" className="py-24 bg-warmbg dark:bg-dark text-navy-900 dark:text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-widest text-gold uppercase">
            ÖNE ÇIKAN SİSTEM ÖZELLİKLERİ
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-navy-900 dark:text-white">
            Salonunuzu Yönetmek Hiç Bu Kadar <br className="hidden md:inline" />
            <span className="italic text-gold font-normal">Kolay Ve Düzenli Olmamıştı.</span>
          </h2>
          <p className="text-base text-navy-800/70 dark:text-gray-400">
            Telefon başında saatler harcamak yerine işinize odaklanın. Sistem sizin yerinize randevu toplasın, hatırlatsın ve raporlasın.
          </p>
        </div>

        {/* Showcase Item 1: Randevu & WhatsApp (Text Left, Image Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/30">
              <Zap className="w-3.5 h-3.5" />
              <span>7/24 Randevu Kabulü</span>
            </div>

            <h3 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
              Müşterileriniz Uyurken Bile Randevu Alabilsin.
            </h3>

            <p className="text-navy-800/75 dark:text-gray-300 text-base leading-relaxed">
              Müşterileriniz Instagram profilinizdeki veya WhatsApp biyografi linkinizdeki web sayfanıza girer, istediği personeli ve uygun saati seçerek saniyeler içinde randevu oluşturur.
            </p>

            <ul className="space-y-3 text-sm text-navy-900 dark:text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Otomatik WhatsApp ve SMS onay mesajları</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Randevu saatinden 2 saat önce otomatik hatırlatma</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Müşterinin randevuya gelmeme (no-show) oranını %70 azaltır</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-borderlight dark:border-white/10 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-navy-900 dark:text-white block">WhatsApp Bildirim Modülü</span>
                    <span className="text-[11px] text-gray-400">Canlı Hatırlatma Gönderimi</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                  Aktif Servis
                </span>
              </div>

              {/* Chat Bubble Graphic */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                    <span>💬 WhatsApp Otomatik Mesaj</span>
                    <span>14:00</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-normal">
                    "Sayın Zeynep Hanım, bugün saat 16:30'da Artisan Hair Studio'daki 'Boya & Kesim' randevunuzu hatırlatırız. Randevuyu onaylamak için 1'i tuşlayabilirsiniz."
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-950/40 border border-gray-200/40 dark:border-white/5 text-xs flex items-center justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Yanıt Durumu:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Müşteri Tarafından Onaylandı</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Item 2: Müşteri Hafızası & CRM (Image Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#111A2E] border border-borderlight dark:border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-navy-900 dark:text-white block">Müşteri Kartı — Elif Yıldız</span>
                    <span className="text-[11px] text-gray-400">14 Toplam Ziyaret | VIP Müşteri</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-bold">
                  VIP Kart
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-warmbg dark:bg-navy-950/50 border border-gray-200/50 dark:border-white/5 space-y-1">
                  <span className="text-gray-400 font-semibold block text-[10px] uppercase">Özel Kuaför Notu</span>
                  <p className="font-medium text-navy-900 dark:text-gray-200">
                    "Dip boya numarası: 7.1 Küllü Kumral + %6 Oksidan. Hassas saç derisi var, organik şampuan tercih ediyor."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-950/40 border border-gray-200/40 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 block">Son Ziyaret</span>
                    <span className="font-bold text-navy-900 dark:text-white">12 Ağustos 2026</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-navy-950/40 border border-gray-200/40 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 block">Toplam Harcama</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₺6.850</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-bold border border-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Müşteri Sadakati & CRM</span>
            </div>

            <h3 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
              Müşterinizin Neyi Sevdiğini Unutmayın.
            </h3>

            <p className="text-navy-800/75 dark:text-gray-300 text-base leading-relaxed">
              Her müşterinizin geçmiş randevularını, kullandığınız boya numaralarını ve özel isteklerini sistem hafızasında tutun. Müşteriniz salona geldiğinde ona özel muamele yapın.
            </p>

            <ul className="space-y-3 text-sm text-navy-900 dark:text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                <span>Tek tıklamayla müşteri geçmişi ve not kartı</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                <span>Ziyaret sıklığına göre VIP müşteri tanımlama</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-gold shrink-0" />
                <span>Doğum günü ve özel gün tebrik mesajları</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
