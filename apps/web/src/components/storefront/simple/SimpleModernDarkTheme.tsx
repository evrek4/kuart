import React, { useState } from 'react';
import { StorefrontThemeProps } from '../types';
import BookingModal from '../../booking/BookingModal';

export default function SimpleModernDarkTheme({ tenant = {} as any, settings = {} as any, services = [], staff = [] }: StorefrontThemeProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const safeServices = Array.isArray(services) ? services : [];
  const safeStaff = Array.isArray(staff) ? staff : [];

  const handleSelectService = (id: string) => {
    setSelectedServiceId(prev => prev === id ? null : id);
  };

  const selectedService = safeServices.find((s: any) => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-2xl w-full border border-white/10 bg-[#121212] rounded-3xl p-6 sm:p-10 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl">
        {/* Neon Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter text-white">
          {tenant?.name || "Kuaför Salonu"}
        </h1>
        <p className="text-gray-400 mb-8 text-xs sm:text-sm uppercase tracking-widest">
          {settings?.heroSubtitle || "Modern & Dinamik Randevu"}
        </p>
        
        <div className="grid gap-3 mb-8 text-left">
          {safeServices.map((svc: any) => {
            const isSelected = selectedServiceId === svc.id;
            return (
              <div
                key={svc.id}
                onClick={() => handleSelectService(svc.id)}
                className={`flex justify-between items-center p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? "border-2 border-white bg-white/15 shadow-md"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-white bg-white text-black" : "border-white/30"
                  }`}>
                    {isSelected && <span className="text-[10px] font-black">✓</span>}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm sm:text-base block">
                      {svc.name}
                    </span>
                    {svc.duration && (
                      <span className="text-xs text-gray-400">
                        ⏱ {svc.duration} dk
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-emerald-400 font-black text-base sm:text-lg">
                  {svc.price} ₺
                </span>
              </div>
            );
          })}
        </div>
        
        <button 
          onClick={() => setIsBookingOpen(true)}
          className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {selectedService ? (
            <>
              <span>DEVAM ET ({selectedService.name})</span>
              <span>➔</span>
            </>
          ) : (
            <>
              <span>HEMEN RANDEVU AL</span>
              <span>➔</span>
            </>
          )}
        </button>
      </div>

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        tenantSlug={tenant?.slug || ""}
        services={safeServices}
        staffList={safeStaff}
        theme="dark"
        initialServiceId={selectedServiceId || undefined}
        globalPaymentPolicy={settings?.globalPaymentPolicy}
        defaultDepositAmount={settings?.requiredDepositAmount}
      />
    </div>
  );
}
