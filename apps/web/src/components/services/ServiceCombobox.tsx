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
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-white/5">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(service)}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all hover:bg-primary/10 hover:text-primary ${
                  search === service ? "bg-primary/20 text-primary font-bold" : "text-gray-300"
                }`}
              >
                ✂️ {service}
              </button>
            ))
          ) : (
            <div className="px-4 py-2.5 text-xs text-gray-500 italic">
              Aramaya uygun varsayılan hizmet bulunamadı.
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSelect("OTHER")}
            className="w-full text-left px-4 py-3 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/20 transition-all flex items-center gap-2 border-t border-white/10"
          >
            <span>✨</span>
            <span>+ Diğer Hizmet Ekle... (Kendi Özel Hizmetinizi Yazın)</span>
          </button>
        </div>
      )}
    </div>
  );
}
