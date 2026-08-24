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

interface LuxuryThemeProps {
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

export default function LuxuryTheme({ salon, onOpenBooking }: LuxuryThemeProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] pb-24 font-sans relative overflow-x-hidden flex flex-col items-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      {/* Hero Banner Section */}
      <section className="w-full max-w-xl relative aspect-[16/10] sm:aspect-[16/8] overflow-hidden border-b border-primary/10">
        <Image
          src={salon.coverImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop"}
          alt={salon.name}
          fill
          priority
          className="object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent">
          {salon.logo && (
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/40 bg-black/40 relative shadow-gold-glow">
                <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight text-white uppercase text-center drop-shadow-gold"
          >
            {salon.name}
          </motion.h1>
          <p className="text-xs text-primary text-center mt-2 font-medium tracking-widest max-w-sm mx-auto uppercase">
            {salon.description}
          </p>
        </div>
      </section>

      {/* About Us Story Section */}
      {salon.aboutText && (
        <section className="w-full max-w-xl px-6 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-primary/10 bg-white/5 backdrop-blur-md shadow-gold-glow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
            <h2 className="text-xs font-black tracking-widest uppercase text-primary mb-3">Hikayemiz</h2>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              {salon.aboutText}
            </p>
          </motion.div>
        </section>
      )}

      {/* Services List Section */}
      <section className="w-full max-w-xl px-6 mt-10">
        <h2 className="text-sm font-black tracking-wider uppercase mb-6 text-primary border-b border-primary/20 pb-2">
          Hizmetlerimiz
        </h2>
        <div className="flex flex-col gap-3">
          {salon.services.map((srv, idx) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex justify-between items-center group hover:border-primary/30 transition-all duration-300"
            >
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors">{srv.name}</h3>
                <span className="text-xs text-gray-400">{srv.duration} Dakika</span>
              </div>
              <span className="font-black text-primary text-sm">{srv.price} TL</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Staff Section */}
      <section className="w-full max-w-xl px-6 mt-12">
        <h2 className="text-sm font-black tracking-wider uppercase mb-6 text-primary border-b border-primary/20 pb-2">
          Uzman Kadromuz
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {salon.staff.map((stf) => (
            <div key={stf.id} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 border border-primary/20 relative mb-3">
                <Image
                  src={stf.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}
                  alt={stf.name}
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <h3 className="font-bold text-xs text-white">{stf.name}</h3>
              <span className="text-[10px] text-gray-400 mt-0.5">{stf.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Media Gallery Section */}
      {salon.gallery && salon.gallery.length > 0 && (
        <section className="w-full max-w-xl px-6 mt-12">
          <h2 className="text-sm font-black tracking-wider uppercase mb-6 text-primary border-b border-primary/20 pb-2">
            Portföy Galerisi
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {salon.gallery.map((photo, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-primary/10 bg-white/5 group hover:border-primary/50 transition-all duration-300 hover:shadow-gold-glow"
              >
                <Image
                  src={photo}
                  alt="Saç Stili Görseli"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs hover:bg-primary/10 transition-colors mb-4 font-bold"
          >
            📷 Instagram Hesabımızı Takip Edin
          </a>
        )}
        <div className="font-semibold text-primary">İLETİŞİM & ADRES</div>
        <p className="text-gray-400">Nişantaşı, Vali Konağı Cd. No:45, Şişli/İstanbul</p>
        <p className="text-primary font-bold">0212 999 8877</p>
      </section>

      {/* Sticky Mobile-First Call-to-Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-[#0B0B0B]/90 backdrop-blur-md border-t border-white/5 flex justify-center z-40">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenBooking}
          className="w-full max-w-md py-3.5 rounded-full bg-primary text-black font-extrabold text-sm tracking-widest uppercase shadow-gold-glow"
        >
          Hemen Randevu Al
        </motion.button>
      </div>
    </div>
  );
}
