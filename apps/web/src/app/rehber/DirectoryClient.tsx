"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TURKEY_PROVINCES } from "@/data/turkey-provinces";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Salon {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  province: string | null;
  district: string | null;
  fullAddress: string | null;
  promotedLevel: "NONE" | "PROVINCE" | "DISTRICT";
  promotedUntil: string | null;
  isPromoted: boolean;
  logo: string | null;
  coverImage: string | null;
  heroTitle: string | null;
  phone: string | null;
}

// Salon ismine göre gradient rengi belirle (deterministik)
function getGradientForName(name: string): string {
  const gradients = [
    "from-violet-600 to-purple-900",
    "from-rose-500 to-pink-900",
    "from-blue-600 to-indigo-900",
    "from-emerald-500 to-teal-900",
    "from-amber-500 to-orange-900",
    "from-cyan-500 to-sky-900",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

// İnitial avatar
function SalonAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const gradient = getGradientForName(name);
  const sizeClass = size === "sm" ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-white shadow-lg shrink-0`}
    >
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

export default function DirectoryClient() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtre State'leri
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const availableDistricts = selectedProvince
    ? (TURKEY_PROVINCES.find((p) => p.name === selectedProvince)?.districts ?? [])
    : [];

  useEffect(() => {
    setSelectedDistrict("");
  }, [selectedProvince]);

  const fetchSalons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (selectedProvince) query.append("province", selectedProvince);
      if (selectedDistrict) query.append("district", selectedDistrict);

      const res = await fetch(`${API_URL}/api/directory/salons?${query.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setSalons(json.data);
      } else {
        setError(json.error?.message || "Kuaförler yüklenirken bir hata oluştu.");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [selectedProvince, selectedDistrict]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const getSalonUrl = (salon: Salon) => {
    if (salon.customDomain) return `https://${salon.customDomain}`;
    return `/${salon.slug}`;
  };

  const promotedSalons = salons.filter((s) => s.isPromoted);
  const regularSalons = salons.filter((s) => !s.isPromoted);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-14">

      {/* ===== BAŞLIK ===== */}
      <div className="flex flex-col items-center text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest text-[#0B1933]/60 dark:text-white/40 border border-[#0B1933]/10 dark:border-white/10 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Kuaför Rehberi
          </span>

          <h1 className="text-4xl md:text-6xl font-black text-[#0B1933] dark:text-white uppercase tracking-tighter leading-none">
            Şehrindeki En İyi<br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Kuaförleri
            </span>{" "}
            Keşfet
          </h1>
          <p className="text-sm md:text-base text-[#0B1933]/50 dark:text-white/40 max-w-xl leading-relaxed">
            İl ve ilçene göre filtrele, randevunu dakikalar içinde al.
          </p>
        </motion.div>

        {/* ===== FİLTRE KUTUSU ===== */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#0A111E] p-3 rounded-2xl border border-[#0B1933]/10 dark:border-white/8 shadow-xl shadow-black/5 dark:shadow-black/30">
            {/* İl */}
            <div className="flex-1 relative">
              <label className="absolute -top-2 left-3 text-[10px] uppercase font-black text-[#0B1933]/40 dark:text-white/30 tracking-widest bg-white dark:bg-[#0A111E] px-1">
                İl
              </label>
              <select
                id="province-select"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-[#0B1933]/10 dark:border-white/8 rounded-xl px-4 py-3.5 text-sm text-[#0B1933] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Tüm Türkiye</option>
                {TURKEY_PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* İlçe */}
            <div className="flex-1 relative">
              <label className="absolute -top-2 left-3 text-[10px] uppercase font-black text-[#0B1933]/40 dark:text-white/30 tracking-widest bg-white dark:bg-[#0A111E] px-1">
                İlçe
              </label>
              <select
                id="district-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedProvince || availableDistricts.length === 0}
                className="w-full bg-gray-50 dark:bg-white/5 border border-[#0B1933]/10 dark:border-white/8 rounded-xl px-4 py-3.5 text-sm text-[#0B1933] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">{selectedProvince ? "Tüm İlçeler" : "Önce il seçin"}</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== SONUÇLAR ===== */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-28 gap-4">
          <div className="relative w-14 h-14">
            <span className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
            <span className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
          </div>
          <span className="text-sm text-[#0B1933]/40 dark:text-white/30 animate-pulse">Salonlar yükleniyor...</span>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-900/10 flex flex-col items-center gap-3"
        >
          <span className="text-3xl">⚠️</span>
          <p className="font-bold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchSalons}
            className="mt-2 text-xs font-bold uppercase tracking-wider text-red-500 border border-red-300 dark:border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
          >
            Tekrar Dene
          </button>
        </motion.div>
      ) : salons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-28 rounded-2xl border border-[#0B1933]/8 dark:border-white/8 bg-white dark:bg-[#0A111E] flex flex-col items-center gap-3"
        >
          <span className="text-5xl">🔍</span>
          <p className="font-bold text-[#0B1933] dark:text-white">Bu bölgede kayıtlı salon bulunamadı</p>
          <p className="text-sm text-[#0B1933]/40 dark:text-white/30">Farklı bir il veya ilçe deneyin</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-10">

          {/* ===== ÖNE ÇIKANLAR ===== */}
          <AnimatePresence mode="wait">
            {promotedSalons.length > 0 && (
              <motion.div
                key="promoted"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4"
              >
                {/* Section Label */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 dark:text-amber-400">
                    ⭐ Öne Çıkan Salonlar
                  </span>
                  <span className="h-px flex-1 bg-amber-400/20" />
                  <span className="text-[10px] text-amber-600/60 dark:text-amber-400/40 font-semibold">
                    {promotedSalons.length} salon
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {promotedSalons.map((salon, i) => (
                    <PromotedSalonCard key={salon.id} salon={salon} index={i} getSalonUrl={getSalonUrl} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== NORMAL SALONLAR ===== */}
          <AnimatePresence mode="wait">
            {regularSalons.length > 0 && (
              <motion.div
                key="regular"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: promotedSalons.length > 0 ? 0.1 : 0 }}
                className="flex flex-col gap-4"
              >
                {promotedSalons.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#0B1933]/40 dark:text-white/30">
                      Tüm Salonlar
                    </span>
                    <span className="h-px flex-1 bg-[#0B1933]/10 dark:bg-white/8" />
                    <span className="text-[10px] text-[#0B1933]/30 dark:text-white/20 font-semibold">
                      {regularSalons.length} salon
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {regularSalons.map((salon, i) => (
                    <RegularSalonCard key={salon.id} salon={salon} index={i} getSalonUrl={getSalonUrl} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
}

// ========== PROMOTED SALON KARTI ==========
function PromotedSalonCard({
  salon,
  index,
  getSalonUrl,
}: {
  salon: Salon;
  index: number;
  getSalonUrl: (s: Salon) => string;
}) {
  const gradient = getGradientForName(salon.name);
  const badgeLabel = salon.promotedLevel === "DISTRICT" ? "Sponsorlu · İlçe" : "Sponsorlu · İl";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <Link href={getSalonUrl(salon)} className="block h-full outline-none group" id={`promoted-salon-${salon.slug}`}>
        <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-amber-400/40 dark:border-amber-400/30 bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-900/10 dark:to-[#0A111E] shadow-[0_0_25px_rgba(251,191,36,0.12)] group-hover:shadow-[0_0_40px_rgba(251,191,36,0.22)] group-hover:border-amber-400/60 transition-all duration-300">

          {/* Kapak Görseli */}
          <div className="relative w-full h-44 overflow-hidden shrink-0">
            {salon.coverImage ? (
              <Image
                src={salon.coverImage}
                alt={salon.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Sponsorlu Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1a0a00] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              <span>⭐</span>
              <span>{badgeLabel}</span>
            </div>

            {/* Logo */}
            <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2.5">
              {salon.logo ? (
                <div className="w-11 h-11 rounded-full bg-white shadow-lg overflow-hidden border-2 border-white/80 shrink-0">
                  <Image
                    src={salon.logo}
                    alt={`${salon.name} logo`}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <SalonAvatar name={salon.name} />
              )}
            </div>

            {/* Glow kenar efekti */}
            <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-2xl pointer-events-none" />
          </div>

          {/* Detaylar */}
          <div className="p-5 flex flex-col gap-3 flex-grow">
            <div>
              <h3 className="text-base font-black text-[#0B1933] dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {salon.name}
              </h3>
              {salon.heroTitle && (
                <p className="text-xs text-[#0B1933]/50 dark:text-white/40 line-clamp-1 mt-0.5 italic">
                  {salon.heroTitle}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-amber-400/10 dark:border-amber-400/8">
              {(salon.province || salon.district) && (
                <div className="flex items-start gap-2 text-xs text-[#0B1933]/60 dark:text-white/40">
                  <span className="shrink-0 mt-0.5">📍</span>
                  <span className="line-clamp-2 leading-relaxed">
                    {salon.district && salon.province
                      ? `${salon.district}, ${salon.province}`
                      : salon.province || salon.district}
                    {salon.fullAddress && ` · ${salon.fullAddress}`}
                  </span>
                </div>
              )}

              {salon.phone && (
                <div className="flex items-center gap-2 text-xs text-[#0B1933]/60 dark:text-white/40">
                  <span>📞</span>
                  <span>{salon.phone}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Randevu Al
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}

// ========== NORMAL SALON KARTI ==========
function RegularSalonCard({
  salon,
  index,
  getSalonUrl,
}: {
  salon: Salon;
  index: number;
  getSalonUrl: (s: Salon) => string;
}) {
  const gradient = getGradientForName(salon.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, delay: (index % 8) * 0.04 }}
      whileHover={{ y: -5 }}
    >
      <Link href={getSalonUrl(salon)} className="block h-full outline-none group" id={`salon-${salon.slug}`}>
        <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-[#0B1933]/8 dark:border-white/8 bg-white dark:bg-[#0A111E] shadow-sm group-hover:shadow-xl group-hover:shadow-black/8 group-hover:border-[#0B1933]/20 dark:group-hover:border-white/15 transition-all duration-300">

          {/* Kapak Görseli */}
          <div className="relative w-full h-36 overflow-hidden shrink-0">
            {salon.coverImage ? (
              <Image
                src={salon.coverImage}
                alt={salon.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Logo */}
            <div className="absolute bottom-3 left-3 z-10">
              {salon.logo ? (
                <div className="w-9 h-9 rounded-full bg-white shadow-md overflow-hidden border-2 border-white/80">
                  <Image
                    src={salon.logo}
                    alt={`${salon.name} logo`}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <SalonAvatar name={salon.name} size="sm" />
              )}
            </div>
          </div>

          {/* Detaylar */}
          <div className="p-4 flex flex-col gap-2.5 flex-grow">
            <h3 className="text-sm font-black text-[#0B1933] dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {salon.name}
            </h3>

            <div className="flex flex-col gap-1.5 mt-auto">
              {(salon.province || salon.district) && (
                <div className="flex items-start gap-1.5 text-[11px] text-[#0B1933]/50 dark:text-white/35">
                  <span className="shrink-0 mt-px">📍</span>
                  <span className="line-clamp-2 leading-relaxed">
                    {salon.district && salon.province
                      ? `${salon.district}, ${salon.province}`
                      : salon.province || salon.district}
                  </span>
                </div>
              )}
              {salon.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#0B1933]/50 dark:text-white/35">
                  <span>📞</span>
                  <span>{salon.phone}</span>
                </div>
              )}
            </div>

            {/* Hover CTA */}
            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Randevu Al
                <svg className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
