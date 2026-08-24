import React, { useState } from 'react';
import { StorefrontThemeProps } from '../types';
import BookingModal from '../../booking/BookingModal';

export default function PortalBasicTheme({ tenant, settings, services, staff }: StorefrontThemeProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-black text-xl text-primary tracking-tight">{tenant.name}</span>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#about" className="hover:text-primary transition-colors">Hakkımızda</a>
            <a href="#services" className="hover:text-primary transition-colors">Hizmetler</a>
            <a href="#team" className="hover:text-primary transition-colors">Ekibimiz</a>
          </div>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="px-5 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90"
          >
            Randevu Al
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-primary/10 py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 text-gray-900">{settings?.heroTitle || `${tenant.name} Kurumsal Portalı`}</h1>
          <p className="text-lg text-gray-600 mb-8">{settings?.heroSubtitle || "Profesyonel hizmet ve kurumsal yaklaşım."}</p>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg"
          >
            Randevu Oluştur
          </button>
        </div>
      </section>

      {/* About */}
      {settings?.aboutText && (
        <section id="about" className="py-20 px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Hakkımızda</h2>
          <p className="text-gray-600 leading-relaxed">{settings.aboutText}</p>
        </section>
      )}

      {/* Services Grid */}
      <section id="services" className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Hizmetlerimiz</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc: any) => (
              <div key={svc.id} className="p-6 border border-gray-100 rounded-2xl hover:shadow-xl transition-shadow bg-gray-50">
                <h3 className="text-xl font-bold mb-2">{svc.name}</h3>
                <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{svc.description || "Profesyonel hizmet"}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-gray-500 text-sm">{svc.duration} dk</span>
                  <span className="text-primary font-black text-lg">{svc.price} ₺</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} {tenant.name}. Tüm hakları saklıdır.</p>
      </footer>

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        tenantSlug={tenant.slug}
        services={services}
        staffList={staff}
        theme="light"
        globalPaymentPolicy={settings?.globalPaymentPolicy}
        defaultDepositAmount={settings?.requiredDepositAmount}
      />
    </div>
  );
}
