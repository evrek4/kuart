import React, { useState } from 'react';
import { StorefrontThemeProps } from '../types';
import BookingModal from '../../booking/BookingModal';

export default function PortalPremiumTheme({ tenant, settings, services, staff }: StorefrontThemeProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Split Screen Hero */}
      <section className="flex flex-col lg:flex-row min-h-[80vh]">
        <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center bg-gray-50 relative overflow-hidden">
          <div className="absolute top-12 left-12 w-24 h-24 bg-gray-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob" />
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-6 relative z-10 leading-[0.9]">
            {tenant.name}
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-md font-medium relative z-10">
            {settings?.heroSubtitle || "Yenilikçi tarz, yaratıcı dokunuşlar ve eşsiz bir deneyim."}
          </p>
          <div className="relative z-10">
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="px-8 py-4 bg-black text-white text-sm font-bold tracking-widest hover:bg-primary transition-colors"
            >
              RANDEVU AL &rarr;
            </button>
          </div>
        </div>
        
        <div className="lg:w-1/2 bg-gray-900 relative min-h-[40vh] lg:min-h-full">
          {/* Cover image area - if provided in settings, else gradient placeholder */}
          {settings?.coverImage ? (
            <img src={settings.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
          )}
        </div>
      </section>

      {/* Asymmetric Portfolio / Services */}
      <section className="py-24 px-12 lg:px-24">
        <h2 className="text-4xl font-black tracking-tighter mb-16">HİZMET<br/><span className="text-gray-400">KOLEKSİYONU</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {services.map((svc: any, index: number) => {
            const isLarge = index % 3 === 0; // Asimetrik görünüm için
            return (
              <div key={svc.id} className={`p-8 bg-gray-50 hover:bg-gray-100 transition-colors ${isLarge ? 'md:col-span-8' : 'md:col-span-4'} flex flex-col justify-between min-h-[250px]`}>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{svc.name}</h3>
                  <p className="text-gray-600 line-clamp-3">{svc.description}</p>
                </div>
                <div className="flex justify-between items-end mt-8">
                  <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">{svc.duration} DK</span>
                  <span className="text-3xl font-black">{svc.price} ₺</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
