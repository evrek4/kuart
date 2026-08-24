import React, { useState } from 'react';
import { StorefrontThemeProps } from '../types';
import BookingModal from '../../booking/BookingModal';

export default function PortalGoldTheme({ tenant, settings, services, staff }: StorefrontThemeProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="font-serif text-2xl text-[#D4AF37] tracking-widest uppercase">{tenant.name}</span>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 uppercase tracking-wider text-xs font-bold"
          >
            Rezervasyon
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-8">
          Premium Salon
        </div>
        <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
          {settings?.heroTitle || "Güzelliğin Altın Çağı"}
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide mb-12 max-w-2xl mx-auto">
          {settings?.heroSubtitle || "Kişiselleştirilmiş lüks deneyim ve uzman kadro ile mükemmelliği keşfedin."}
        </p>
        <button 
          onClick={() => setIsBookingOpen(true)}
          className="px-10 py-4 bg-[#D4AF37] text-black hover:bg-white transition-colors duration-500 uppercase tracking-widest text-sm font-bold"
        >
          Randevu Takvimi
        </button>
      </section>

      {/* Services Gold Grid */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-16 text-[#D4AF37]">Özel Hizmetlerimiz</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((svc: any) => (
              <div key={svc.id} className="group p-8 border border-white/10 hover:border-[#D4AF37]/50 bg-white/5 transition-all duration-500 flex justify-between items-center cursor-pointer">
                <div>
                  <h3 className="text-xl font-serif mb-2 group-hover:text-[#D4AF37] transition-colors">{svc.name}</h3>
                  <p className="text-gray-500 text-sm">{svc.duration} Dakika Özel Seans</p>
                </div>
                <span className="text-2xl font-light text-[#D4AF37]">{svc.price} ₺</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        tenantSlug={tenant.slug}
        services={services}
        staffList={staff}
        theme="dark"
        globalPaymentPolicy={settings?.globalPaymentPolicy}
        defaultDepositAmount={settings?.requiredDepositAmount}
      />
    </div>
  );
}
