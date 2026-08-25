'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, Scissors } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const isDark = document.documentElement.classList.contains('dark') ||
                   localStorage.getItem('theme') === 'dark' ||
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-dark-DEFAULT/95 backdrop-blur-sm border-b border-borderlight dark:border-dark-border py-4 shadow-sm'
          : 'bg-white dark:bg-dark-DEFAULT py-5 border-b border-transparent dark:border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo - Minimalist */}
        <Link href="/" className="flex items-center gap-2 group">
          <Scissors className="w-5 h-5 text-lightText-primary dark:text-darkText-primary" />
          <span className="font-serif text-xl font-bold text-lightText-primary dark:text-darkText-primary flex items-center gap-0.5">
            kuaför<span className="text-gold font-sans font-extrabold tracking-tight">.art</span>
          </span>
        </Link>

        {/* Desktop Nav Links - Wide Spacing */}
        <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium text-lightText-secondary dark:text-darkText-secondary">
          <a href="#features" className="hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
            Hizmetler
          </a>
          <a href="#how-it-works" className="hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
            Nasıl Çalışır
          </a>
          <a href="#pricing" className="hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
            Fiyatlandırma
          </a>
          <a href="#contact" className="hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors">
            İletişim
          </a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="text-lightText-muted dark:text-darkText-muted hover:text-lightText-primary dark:hover:text-darkText-primary transition-colors"
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <Link
            href="/login"
            className="text-[15px] font-semibold text-lightText-primary dark:text-darkText-primary hover:text-gold transition-colors"
          >
            Giriş Yap
          </Link>

          <Link
            href="/register"
            className="px-5 py-2.5 text-[14px] font-bold text-white bg-navy-900 hover:bg-navy-800 dark:bg-gold dark:text-navy-950 dark:hover:bg-gold-400 rounded-lg transition-all shadow-[0_4px_14px_rgba(11,27,54,0.1)] hover:-translate-y-0.5"
          >
            Ücretsiz Başla
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-lightText-primary dark:text-darkText-primary"
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-lightText-primary dark:text-darkText-primary"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-DEFAULT border-b border-borderlight dark:border-dark-border px-6 py-6 shadow-sm">
          <nav className="flex flex-col space-y-4 font-medium text-lightText-secondary dark:text-darkText-secondary">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-borderlight dark:border-dark-border">Hizmetler</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-borderlight dark:border-dark-border">Nasıl Çalışır</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-borderlight dark:border-dark-border">Fiyatlandırma</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-borderlight dark:border-dark-border">İletişim</a>
          </nav>

          <div className="pt-6 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg border border-borderlight dark:border-dark-border font-semibold text-lightText-primary dark:text-darkText-primary"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg bg-navy-900 text-white dark:bg-gold dark:text-navy-950 font-bold"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
