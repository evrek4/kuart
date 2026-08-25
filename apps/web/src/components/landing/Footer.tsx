'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-gray-400 py-16 border-t border-white/10 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/10">
        {/* Left Column: Brand Statement */}
        <div className="md:col-span-5 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold text-navy-950 flex items-center justify-center font-bold shadow-md">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold text-white tracking-tight">
              kuaför<span className="text-gold font-sans font-extrabold">.art</span>
            </span>
          </Link>

          <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
            Kuaförler ve güzellik salonları için tasarlanmış yeni nesil randevu, müşteri ve salon yönetim platformu.
          </p>

          <div className="pt-2 text-xs text-gold font-semibold">
            7/24 Canlı Randevu & Müşteri Altyapısı
          </div>
        </div>

        {/* Column 2: Ürün */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ürün</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#features" className="hover:text-gold transition-colors">
                Özellikler
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-gold transition-colors">
                Nasıl Çalışır?
              </a>
            </li>
            <li>
              <a href="#website" className="hover:text-gold transition-colors">
                Kişisel Web Sitesi
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-gold transition-colors">
                Fiyatlandırma
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Hesabım */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hızlı Erişim</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/login" className="hover:text-gold transition-colors">
                Salon Girişi
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-gold transition-colors">
                Ücretsiz Kayıt Ol
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-gold transition-colors">
                Paketler
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: İletişim & Destek */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">İletişim & Destek</h4>
          <p className="text-xs text-gray-400">
            Sorularınız veya yardım talepleriniz için bize e-posta gönderebilirsiniz:
          </p>
          <a href="mailto:destek@kuafor.art" className="text-xs font-bold text-gold hover:underline block">
            destek@kuafor.art
          </a>
        </div>
      </div>

      {/* Bottom Legal Copyright */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div>
          &copy; {new Date().getFullYear()} KuaförArt. Tüm hakları saklıdır.
        </div>
        <div className="flex gap-6">
          <span className="hover:text-gray-400 cursor-pointer">Gizlilik Politikası</span>
          <span className="hover:text-gray-400 cursor-pointer">Kullanım Koşulları</span>
        </div>
      </div>
    </footer>
  );
}
