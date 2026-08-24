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

interface MinimalistThemeProps {
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

export default function MinimalistTheme({ salon, onOpenBooking }: MinimalistThemeProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] pb-24 font-sans flex flex-col items-center">
      {/* Clean Cover Hero */}
      <section className="w-full max-w-xl relative aspect-[16/9] overflow-hidden border-b border-black/5 bg-gray-100">
        <Image
          src={salon.coverImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop"}
          alt={salon.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6">
          <div className="flex items-center gap-3">
            {salon.logo && (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative shrink-0 bg-white">
                <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm uppercase">
              {salon.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Intro Description */}
      <section className="w-full max-w-xl px-6 mt-8">
        <p className="text-sm text-gray-600 leading-relaxed font-light">
          {salon.description}
        </p>
        {salon.aboutText && (
          <p className="text-xs text-gray-500 mt-3 leading-relaxed border-l-2 border-black/10 pl-3">
            {salon.aboutText}
          </p>
        )}
      </section>

      {/* Services List */}
      <section className="w-full max-w-xl px-6 mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 pb-1 border-b border-black/5">
          Hizmetlerimiz
        </h2>
        <div className="flex flex-col gap-2">
          {salon.services.map((srv) => (
            <div
              key={srv.id}
              className="py-3 flex justify-between items-center border-b border-black/[0.03]"
            >
              <div>
                <h3 className="font-semibold text-sm text-black">{srv.name}</h3>
                <span className="text-xs text-gray-500">{srv.duration} Dk</span>
              </div>
              <span className="font-bold text-sm text-black">{srv.price} TL</span>
            </div>
          ))}
        </div>
      </section>

      {/* Staff Grid */}
      <section className="w-full max-w-xl px-6 mt-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 pb-1 border-b border-black/5">
          Ekibimiz
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {salon.staff.map((stf) => (
            <div key={stf.id} className="p-4 rounded-xl border border-black/5 bg-white flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 relative mb-3 overflow-hidden">
                <Image
                  src={stf.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}
                  alt={stf.name}
                  fill
                  className="object-cover grayscale"
                />
              </div>
              <h3 className="font-bold text-xs text-black">{stf.name}</h3>
              <span className="text-[10px] text-gray-400 mt-0.5">{stf.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Banner if available */}
      {salon.instagramUrl && (
        <a
          href={salon.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 text-xs font-bold text-gray-500 hover:text-black transition-colors"
        >
          📷 Instagram Profilimiz ➔
        </a>
      )}

      {/* Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-white/95 border-t border-black/5 flex justify-center z-40">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenBooking}
          className="w-full max-w-md py-3.5 rounded-xl bg-black text-white font-extrabold text-sm tracking-wider uppercase"
        >
          Randevu Al
        </motion.button>
      </div>
    </div>
  );
}
