'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#081326] pt-20 pb-10 border-t border-borderlight dark:border-dark-border selection:bg-gold/30">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Scissors className="w-5 h-5 text-lightText-primary dark:text-darkText-primary" />
              <span className="font-serif text-xl font-bold text-lightText-primary dark:text-darkText-primary flex items-center gap-0.5">
                kuaför<span className="text-gold font-sans font-extrabold tracking-tight">.art</span>
              </span>
            </Link>
            <p className="text-[14px] text-lightText-secondary dark:text-darkText-secondary mb-6 leading-relaxed">
              Kuaför ve güzellik salonları için tasarlanmış profesyonel dijital yönetim platformu. Müşterilerinizi, randevularınızı ve gelirinizi tek noktadan kolayca yönetin.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 dark:bg-dark-card border border-borderlight dark:border-dark-border text-lightText-muted dark:text-darkText-muted hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 dark:bg-dark-card border border-borderlight dark:border-dark-border text-lightText-muted dark:text-darkText-muted hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 dark:bg-dark-card border border-borderlight dark:border-dark-border text-lightText-muted dark:text-darkText-muted hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            <div className="space-y-4">
              <h4 className="text-[13px] font-bold text-lightText-primary dark:text-darkText-primary uppercase tracking-wider">Ürün</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Fiyatlandırma</a></li>
                <li><a href="#how-it-works" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Kurulum</a></li>
                <li><Link href="/register" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Kayıt Ol</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[13px] font-bold text-lightText-primary dark:text-darkText-primary uppercase tracking-wider">Destek</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Sıkça Sorulan Sorular</a></li>
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">İletişim</a></li>
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Sistem Durumu</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[13px] font-bold text-lightText-primary dark:text-darkText-primary uppercase tracking-wider">Kurumsal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">Kullanım Şartları</a></li>
                <li><a href="#" className="text-[14px] text-lightText-secondary dark:text-darkText-secondary hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">KVKK Aydınlatma Metni</a></li>
              </ul>
            </div>
            
          </div>
        </div>

        <div className="pt-8 border-t border-borderlight dark:border-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-lightText-muted dark:text-darkText-muted">
            &copy; {currentYear} Kuaför Art Dijital Çözümler. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[12px] font-medium text-lightText-secondary dark:text-darkText-secondary">Sistemler Aktif</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
