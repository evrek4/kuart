"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface ArtisticThemeProps {
  salon: {
    name: string;
    description: string;
    coverImage: string;
    logo?: string | null;
    aboutText?: string;
    instagramUrl?: string;
    services: Service[];
    staff: Staff[];
    gallery: string[];
  };
  onOpenBooking: () => void;
}

export default function ArtisticTheme({ salon, onOpenBooking }: ArtisticThemeProps) {
  return (
    <div className="min-h-screen bg-[#0E071D] text-[#ECE7F2] pb-24 font-sans relative overflow-x-hidden flex flex-col items-center">
      {/* Background Neon Gradients */}
      <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] rounded-full bg-[#E11D48]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#7C3AED]/15 blur-[150px] pointer-events-none" />

      {/* Asymmetric Header */}
      <section className="w-full max-w-xl px-6 pt-12 flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, rotate: -2, y: 20 }}
          animate={{ opacity: 1, rotate: -1, y: 0 }}
          className="relative aspect-[16/9] w-full rounded-[2rem] overflow-hidden border-2 border-[#E11D48]/30 shadow-[0_0_30px_rgba(225,29,72,0.15)]"
        >
          <Image
            src={salon.coverImage || "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=1200&auto=format&fit=crop"}
            alt={salon.name}
            fill
            priority
            className="object-cover brightness-[0.4] saturate-[1.2]"
          />
          <div className="absolute inset-0 bg-[#0E071D]/40 flex flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <span className="text-[9px] uppercase tracking-[0.3em] bg-[#E11D48]/80 text-white font-black px-3 py-1 rounded-full self-start">
                ARTISTIC VİTRİN
              </span>
              {salon.logo && (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E11D48]/40 bg-black/40">
                  <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                {salon.name}
              </h1>
              <p className="text-xs text-[#C084FC] mt-2 font-medium leading-relaxed">
                {salon.description}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Story / About text inside a skewed artistic container */}
      {salon.aboutText && (
        <section className="w-full max-w-xl px-6 mt-8">
          <div className="p-6 bg-gradient-to-br from-[#7C3AED]/20 to-[#E11D48]/10 border border-[#E11D48]/20 rounded-[2rem] rounded-tl-none relative">
            <span className="absolute -top-3 left-0 bg-[#7C3AED] text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-md">
              BIZ KİMİZ?
            </span>
            <p className="text-xs text-gray-300 leading-relaxed pt-2">
              {salon.aboutText}
            </p>
          </div>
        </section>
      )}

      {/* Services List (Grid Layout) */}
      <section className="w-full max-w-xl px-6 mt-10">
        <h2 className="text-md font-black tracking-widest uppercase mb-6 text-[#E11D48] flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E11D48] rounded-full inline-block" />
          MENÜ & FİYATLAR
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {salon.services.map((srv, idx) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-[#1B112D]/80 border border-[#7C3AED]/20 rounded-2xl flex justify-between items-center hover:border-[#E11D48]/40 transition-colors"
            >
              <div>
                <h3 className="font-extrabold text-sm text-white">{srv.name}</h3>
                <span className="text-[10px] text-gray-400">{srv.duration} Dakika</span>
              </div>
              <span className="font-black text-[#C084FC] text-sm">{srv.price} TL</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Artistic Staff Grid */}
      <section className="w-full max-w-xl px-6 mt-12">
        <h2 className="text-md font-black tracking-widest uppercase mb-6 text-[#E11D48] flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#E11D48] rounded-full inline-block" />
          YARATICI EKİP
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {salon.staff.map((stf) => (
            <div key={stf.id} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden bg-[#7C3AED]/20 border-2 border-[#7C3AED]/40 relative mb-3 rotate-3 hover:rotate-0 transition-transform duration-300">
                <Image
                  src={stf.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}
                  alt={stf.name}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <h3 className="font-black text-xs text-white">{stf.name}</h3>
              <span className="text-[9px] text-[#C084FC] mt-0.5">{stf.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Media Gallery Section */}
      {salon.gallery && salon.gallery.length > 0 && (
        <section className="w-full max-w-xl px-6 mt-12">
          <h2 className="text-md font-black tracking-widest uppercase mb-6 text-[#E11D48] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#E11D48] rounded-full inline-block" />
            GALERİ
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {salon.gallery.map((photo, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-[2rem] overflow-hidden border border-[#7C3AED]/20 bg-[#1B112D]/80 group hover:border-[#E11D48]/60 transition-all duration-300 hover:scale-[1.01]"
              >
                <Image
                  src={photo}
                  alt="Saç Stili Görseli"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Address & Contact Info */}
      <section className="w-full max-w-xl px-6 mt-12 mb-10 text-center text-xs space-y-2">
        {salon.instagramUrl && (
          <a
            href={salon.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#FF4E72] text-xs hover:bg-[#E11D48]/20 transition-all mb-4 font-bold"
          >
            📷 Instagram Hesabımızı Takip Edin
          </a>
        )}
        <div className="font-semibold text-[#E11D48]">ADRES & TELEFON</div>
        <p className="text-gray-400">Nişantaşı, Vali Konağı Cd. No:45, Şişli/İstanbul</p>
        <p className="text-white font-bold text-sm">0212 999 8877</p>
      </section>

      {/* Sticky Mobile-First Call-to-Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-[#0E071D]/90 backdrop-blur-md border-t border-white/5 flex justify-center z-40">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenBooking}
          className="w-full max-w-md py-3.5 rounded-full bg-gradient-to-r from-[#E11D48] to-[#7C3AED] text-white font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:brightness-110 transition-all"
        >
          Rezervasyon Yap
        </motion.button>
      </div>
    </div>
  );
}
