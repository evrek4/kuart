"use client";

import React, { useState, useEffect, useRef } from "react";

export const PREDEFINED_SERVICES = [
  "Saç Kesimi (Kadın)",
  "Saç Kesimi (Erkek)",
  "Fön & Stil",
  "Dip Boya",
  "Tüm Boya",
  "Ombre & Sombre",
  "Röfle & Meç",
  "Balyaj",
  "Keratin Bakım / Brezilya Fönü",
  "Saç Bakım & Maske",
  "Sakal Tıraşı & Bakım",
  "Damat Tıraşı",
  "Gelin Başı & Makyaj",
  "Ağda / Kaş Bıyık",
  "Manikür",
  "Pedikür",
  "Protez Tırnak & Kalıcı Oje",
  "Cilt Bakımı",
];

interface ServiceComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function ServiceCombobox({
  value,
  onChange,
  placeholder = "Hizmet seçin veya yazın...",
  required = false,
}: ServiceComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredServices = PREDEFINED_SERVICES.filter((service) =>
    service.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (serviceName: string) => {
    if (serviceName === "OTHER") {
      setIsCustomMode(true);
      setSearch("");
      onChange("");
      setIsOpen(false);
      return;
    }
    setSearch(serviceName);
    onChange(serviceName);
    setIsCustomMode(false);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearch(newVal);
    onChange(newVal);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={isCustomMode ? "Özel Hizmet Adı Yazın..." : placeholder}
          className="w-full bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 text-neutral-400 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, idx) => {
              const isSelected = search === service;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(service)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                      : "text-neutral-800 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                >
                  <span className="text-amber-500 mr-1.5">✂️</span>
                  <span>{service}</span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-2.5 text-xs text-neutral-500 dark:text-gray-400 italic">
              Aramaya uygun varsayılan hizmet bulunamadı.
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelect("OTHER")}
            className="w-full text-left px-4 py-3 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 transition-all flex items-center gap-2 border-t border-neutral-200 dark:border-white/10"
          >
            <span>✨</span>
            <span>+ Diğer Hizmet Ekle... (Kendi Özel Hizmetinizi Yazın)</span>
          </button>
        </div>
      )}
    </div>
  );
}
