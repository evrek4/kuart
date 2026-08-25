'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, ArrowRight, Scissors } from 'lucide-react';

interface NavbarProps {
  cmsData?: any;
}

export default function Navbar({ cmsData }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Initial theme check
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
          ? 'bg-[#F8F8F6]/90 dark:bg-[#0A111E]/90 backdrop-blur-md border-b border-[#E6E7EA] dark:border-white/10 py-3.5 shadow-sm'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-navy-900 dark:bg-gold text-white dark:text-navy-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-navy-900 dark:text-white flex items-center gap-0.5">
            kuaför<span className="text-gold font-sans font-extrabold">.art</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-navy-800/80 dark:text-gray-300">
          <a href="#features" className="hover:text-navy-900 dark:hover:text-white transition-colors">
            Özellikler
          </a>
          <a href="#how-it-works" className="hover:text-navy-900 dark:hover:text-white transition-colors">
            Nasıl Çalışır?
          </a>
          <a href="#website" className="hover:text-navy-900 dark:hover:text-white transition-colors">
            Web Siteniz
          </a>
          <a href="#pricing" className="hover:text-navy-900 dark:hover:text-white transition-colors">
            Fiyatlandırma
          </a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-navy-800 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-navy-900" />}
          </button>

          <Link
            href="/login"
            className="text-sm font-semibold text-navy-900 dark:text-gray-200 hover:text-gold transition-colors px-3 py-2"
          >
            Giriş Yap
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 dark:bg-gold dark:text-navy-950 dark:hover:bg-gold-400 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span>Ücretsiz Başla</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-navy-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Tema Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-navy-900 dark:text-white bg-black/5 dark:bg-white/10"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F8F6] dark:bg-[#0A111E] border-b border-[#E6E7EA] dark:border-white/10 px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 font-medium text-navy-900 dark:text-gray-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-gray-200/60 dark:border-white/5"
            >
              Özellikler
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-gray-200/60 dark:border-white/5"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#website"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-gray-200/60 dark:border-white/5"
            >
              Web Siteniz
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 border-b border-gray-200/60 dark:border-white/5"
            >
              Fiyatlandırma
            </a>
          </nav>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl border border-navy-900/20 dark:border-white/20 font-semibold text-navy-900 dark:text-white"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-xl bg-navy-900 text-white dark:bg-gold dark:text-navy-950 font-bold shadow-md"
            >
              Ücretsiz Başla →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
