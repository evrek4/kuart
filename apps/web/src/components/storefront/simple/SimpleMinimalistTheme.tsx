import React, { useState } from 'react';
import { StorefrontThemeProps } from '../types';
import BookingModal from '../../booking/BookingModal';

export default function SimpleMinimalistTheme({ tenant = {} as any, settings = {} as any, services = [], staff = [] }: StorefrontThemeProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const safeServices = Array.isArray(services) ? services : [];
  const safeStaff = Array.isArray(staff) ? staff : [];

  const handleSelectService = (id: string) => {
    setSelectedServiceId(prev => prev === id ? null : id);
  };

  const selectedService = safeServices.find((s: any) => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-200">
      <div className="max-w-2xl w-full bg-white dark:bg-[#121212] shadow-xl rounded-3xl p-6 sm:p-10 text-center border border-gray-200 dark:border-neutral-800 transition-colors">
        
        {/* Salon Başlığı & Açıklama */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          {tenant?.name || "Kuaför Salonu"}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8">
          {settings?.heroSubtitle || "Hızlı ve Pratik Online Randevu"}
        </p>
        
        {/* Hizmet Listesi */}
        <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 p-5 sm:p-6 rounded-2xl mb-8 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Hizmetlerimiz
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {safeServices.length} Hizmet
            </span>
          </div>

          <div className="grid gap-3">
            {safeServices.map((svc: any) => {
              const isSelected = selectedServiceId === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => handleSelectService(svc.id)}
                  className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? "border-2 border-black dark:border-white bg-black/5 dark:bg-white/10 shadow-sm"
                      : "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-gray-300 dark:border-neutral-700 bg-transparent"
                    }`}>
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base block">
                        {svc.name}
                      </span>
                      {svc.duration && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ⏱ {svc.duration} dk
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-gray-900 dark:text-emerald-400 font-bold text-base sm:text-lg">
                    {svc.price} ₺
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Aksiyon Butonu */}
        <button 
          onClick={() => setIsBookingOpen(true)}
          className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
        >
          {selectedService ? (
            <>
              <span>Devam Et ({selectedService.name})</span>
              <span>➔</span>
            </>
          ) : (
            <>
              <span>Randevu Al</span>
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
