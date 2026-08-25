"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";
import ServiceCombobox from "@/components/services/ServiceCombobox";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  isActive: boolean;
}

export default function ServicesCRUDPage() {
  const router = useRouter();

  // Tenant bilgisi JWT'den okunur
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  // JWT'den tenant bilgisi al
  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/services");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  const fetchServices = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      setLoading(true);
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/services`, {
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setServices(json.data || []);
      }
    } catch (err) {
      console.error("Fetch services error:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, API_BASE]);

  useEffect(() => {
    if (authReady && tenantSlug) {
      fetchServices();
    }
  }, [authReady, tenantSlug, fetchServices]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setDuration(30);
    setPrice("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || "");
    setDuration(service.duration);
    setPrice(service.price !== null ? service.price.toString() : "");
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !duration || !tenantSlug) return;

    const payload = {
      name,
      description: description || undefined,
      duration: Number(duration),
      price: price ? parseFloat(price) : null,
    };

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const headers = {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      let response;
      if (editingService) {
        // Edit service
        response = await fetch(`${API_BASE}/api/services/${editingService.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create service
        response = await fetch(`${API_BASE}/api/services`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const json = await response.json();
      if (response.ok && json.success && json.data) {
        const savedService = json.data;
        if (editingService) {
          setServices(prev => prev.map(s => (s.id === savedService.id ? { ...s, ...savedService } : s)));
          setSuccessMessage("Hizmet güncellendi!");
        } else {
          setServices(prev => [...prev.filter(s => s.id !== savedService.id), savedService]);
          setSuccessMessage("Yeni hizmet eklendi!");
        }
        setTimeout(() => setSuccessMessage(null), 3000);
        setIsModalOpen(false);
        fetchServices();
      } else {
        // Hata durumunda modal KAPATILMAZ
        alert(json.error?.message || "İşlem başarısız oldu.");
      }
    } catch (err) {
      console.error("Save service error:", err);
      alert("Hata oluştu.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?") || !tenantSlug) return;

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const response = await fetch(`${API_BASE}/api/services/${id}`, {
        method: "DELETE",
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setSuccessMessage("Hizmet silindi.");
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchServices();
      } else {
        alert(json.error?.message || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Delete service error:", err);
      alert("Silme hatası.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-neutral-900 dark:text-white">✂️ HİZMET YÖNETİMİ</h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Hizmet fiyatlarını, sürelerini ve kapora politikalarını düzenleyin</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-colors"
        >
          + Yeni Hizmet Ekle
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-xs font-bold shadow-sm">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 uppercase tracking-widest">Hizmetler Yükleniyor...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center text-sm text-neutral-500 dark:text-gray-400">
          Kayıtlı hizmet bulunamadı. Yeni bir tane ekleyerek başlayın!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary/20 shadow-sm transition-all"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">{service.name}</h3>
                  <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                    {service.duration} Dk
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-gray-400 mt-2 leading-relaxed">
                  {service.description || "Açıklama belirtilmemiş."}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-neutral-100 dark:border-white/5 pt-4">
                <div>
                  <span className="text-[10px] text-neutral-500 dark:text-gray-400 block uppercase tracking-wider">Fiyat / Kapora</span>
                  {service.price !== null && service.price > 0 ? (
                    <span className="text-lg font-black text-neutral-900 dark:text-white">{service.price} TL</span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-500">Belirtilmedi</span>
                      <span className="text-[9px] text-neutral-500 dark:text-gray-400">(150 TL Kapora Alınır)</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(service)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-all text-neutral-800 dark:text-gray-200"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition-all shadow-sm"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 relative shadow-2xl flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    {editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Salonunuza ait bir hizmet şablonu tanımlayın</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveService} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Hizmet Adı *</label>
                  <ServiceCombobox
                    required
                    value={name}
                    onChange={setName}
                    placeholder="örn: Keratin Saç Bakımı veya listeden seçin..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Açıklama</label>
                  <input
                    type="text"
                    placeholder="örn: Yıpranmış saçları onaran premium protein bakımı."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Süre (Dakika) *</label>
                    <select
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-2 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value={15} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">15 Dk</option>
                      <option value={30} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">30 Dk</option>
                      <option value={45} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">45 Dk</option>
                      <option value={60} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">60 Dk (1 Saat)</option>
                      <option value={90} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">90 Dk (1.5 Saat)</option>
                      <option value={120} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">120 Dk (2 Saat)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Fiyat (TL)</label>
                    <input
                      type="number"
                      placeholder="örn: 450"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    />
                  </div>
                </div>

                {!price && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 rounded-xl text-[10px] leading-relaxed">
                    💡 <strong>Not:</strong> Fiyat boş bırakıldığında, bu hizmet için randevu esnasında sabit kapora tutarı tahsil edilecektir.
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
