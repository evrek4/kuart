import React, { useState } from 'react';
import { StorefrontThemeProps } from '../types';
import BookingModal from '../../booking/BookingModal';

export default function SimpleLuxuryCompactTheme({ tenant = {} as any, settings = {} as any, services = [], staff = [] }: StorefrontThemeProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const safeServices = Array.isArray(services) ? services : [];
  const safeStaff = Array.isArray(staff) ? staff : [];

  const handleSelectService = (id: string) => {
    setSelectedServiceId(prev => prev === id ? null : id);
  };

  const selectedService = safeServices.find((s: any) => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] text-[#2C2C2C] dark:text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-8 font-serif transition-colors">
      <div className="max-w-xl w-full bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden border border-[#F0EBE1] dark:border-white/10 transition-colors">
        <div className="bg-[#1A1A1A] p-8 sm:p-10 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C5A880]/20 to-transparent opacity-50" />
          <h1 className="text-3xl sm:text-4xl font-medium text-[#F0EBE1] tracking-widest uppercase relative z-10">
            {tenant?.name || "Kuaför Salonu"}
          </h1>
          <div className="w-12 h-[1px] bg-[#C5A880] mx-auto mt-6 relative z-10" />
        </div>
        
        <div className="p-6 sm:p-8">
          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-8 italic">
            {settings?.heroSubtitle || "Lüks ve Zarafet"}
          </p>
          
          <div className="space-y-3 mb-8">
            {safeServices.map((svc: any) => {
              const isSelected = selectedServiceId === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => handleSelectService(svc.id)}
                  className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? "border-[#C5A880] bg-[#C5A880]/15 dark:bg-[#C5A880]/20 shadow-sm"
                      : "border-[#F0EBE1] dark:border-white/5 bg-[#FAFAFA] dark:bg-white/[0.02] hover:border-[#C5A880]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-[#C5A880] bg-[#C5A880] text-black" : "border-neutral-400"
                    }`}>
                      {isSelected && <span className="text-[9px] font-black">✓</span>}
                    </div>
                    <div>
                      <span className="font-medium text-[#2C2C2C] dark:text-white block text-sm sm:text-base">
                        {svc.name}
                      </span>
                      {svc.duration && (
                        <span className="text-xs text-gray-400">
                          ⏱ {svc.duration} dk
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[#C5A880] font-bold text-base sm:text-lg">
                    {svc.price} ₺
                  </span>
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="w-full py-4 bg-[#1A1A1A] hover:bg-[#C5A880] text-[#F0EBE1] dark:bg-[#C5A880] dark:text-black dark:hover:bg-[#d8be96] text-xs sm:text-sm uppercase tracking-widest font-bold rounded-xl transition-all duration-300 shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {selectedService ? (
              <>
                <span>Rezervasyon Yap ({selectedService.name})</span>
                <span>➔</span>
              </>
            ) : (
              <>
                <span>Rezervasyon Yap</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        tenantSlug={tenant?.slug || ""}
        services={safeServices}
        staffList={safeStaff}
        theme="light"
        initialServiceId={selectedServiceId || undefined}
        globalPaymentPolicy={settings?.globalPaymentPolicy}
        defaultDepositAmount={settings?.requiredDepositAmount}
      />
    </div>
  );
}
