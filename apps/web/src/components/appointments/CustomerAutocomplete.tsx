"use client";

import React, { useState, useEffect, useRef } from "react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface CustomerAutocompleteProps {
  value: string;
  onChangeName: (name: string) => void;
  onSelectCustomer: (customer: { name: string; phone: string }) => void;
  tenantSlug: string | null;
  placeholder?: string;
  required?: boolean;
}

export default function CustomerAutocomplete({
  value,
  onChangeName,
  onSelectCustomer,
  tenantSlug,
  placeholder = "Müşteri adı arayın veya yazın...",
  required = false,
}: CustomerAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    setQuery(value);
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

  useEffect(() => {
    if (!query.trim() || !tenantSlug) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("kuafor-token="))
          ?.split("=")[1];

        const response = await fetch(
          `${API_BASE}/api/customers?search=${encodeURIComponent(query.trim())}`,
          {
            headers: {
              "x-tenant-slug": tenantSlug,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.ok) {
          const json = await response.json();
          if (json.success && Array.isArray(json.data)) {
            setResults(json.data);
          }
        }
      } catch (err) {
        console.error("Customer search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, tenantSlug, API_BASE]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChangeName(val);
    setIsOpen(true);
  };

  const handleSelect = (customer: Customer) => {
    setQuery(customer.name);
    onSelectCustomer({ name: customer.name, phone: customer.phone });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
        {loading ? (
          <div className="absolute right-3 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="absolute right-3 text-neutral-400 dark:text-gray-500 text-xs">🔍</div>
        )}
      </div>

      {isOpen && query.trim() !== "" && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
          {results.length > 0 ? (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-all flex justify-between items-center group"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-gray-400 mt-0.5">{c.phone}</div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                  Eski Müşteri
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-neutral-600 dark:text-gray-400 flex items-center justify-between">
              <span>Eşleşen kayıtlı müşteri bulunamadı.</span>
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                Yeni Kayıt Oluşturulacak
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
