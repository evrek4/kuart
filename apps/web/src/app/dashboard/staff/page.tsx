"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";

interface Staff {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  commissionRate: number;
}

export default function StaffPage() {
  const router = useRouter();

  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [commissionRate, setCommissionRate] = useState("0");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/staff");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  const fetchStaff = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/staff`, {
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setStaffList(json.data || []);
      }
    } catch (err) {
      console.error("Fetch staff error:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, API_BASE]);

  useEffect(() => {
    if (authReady && tenantSlug) {
      fetchStaff();
    }
  }, [authReady, tenantSlug, fetchStaff]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setName("");
    setTitle("");
    setPhone("");
    setAvatar("");
    setCommissionRate("0");
    setError(null); // Bir önceki modal hatasını sıfırla
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setTitle(staff.title || "");
    setPhone(staff.phone || "");
    setAvatar(staff.avatar || "");
    setCommissionRate(String(staff.commissionRate ?? 0));
    setError(null); // Bir önceki modal hatasını sıfırla
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tenantSlug) return;

    if (phone && phone.length > 0 && phone.length < 10) {
      setError("Lütfen geçerli bir telefon numarası girin (En az 10 hane).");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      title: title || undefined,
      phone: phone || undefined,
      avatar: avatar || undefined,
      commissionRate: parseFloat(commissionRate) || 0,
    };

    try {
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("kuafor-token="))
        ?.split("=")[1];

      const headers = {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let response;
      if (editingStaff) {
        response = await fetch(`${API_BASE}/api/staff/${editingStaff.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/api/staff`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const json = await response.json();
      if (response.ok && json.success && json.data) {
        const savedItem = json.data;
        if (editingStaff) {
          setStaffList(prev => prev.map(s => (s.id === savedItem.id ? { ...s, ...savedItem } : s)));
          setSuccessMessage("Personel bilgileri güncellendi!");
        } else {
          setStaffList(prev => [...prev.filter(s => s.id !== savedItem.id), savedItem]);
          setSuccessMessage("Yeni personel eklendi!");
        }
        setTimeout(() => setSuccessMessage(null), 3000);
        setIsModalOpen(false);
        fetchStaff();
      } else {
        // Hata durumunda modal KAPATILMAZ
        setError(json.error?.message || "İşlem başarısız oldu.");
      }
    } catch (err) {
      console.error("Save staff error:", err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Bu personeli silmek istediğinizden emin misiniz?") || !tenantSlug)
      return;

    try {
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/staff/${id}`, {
        method: "DELETE",
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setSuccessMessage("Personel silindi.");
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchStaff();
      } else {
        setError(json.error?.message || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Delete staff error:", err);
      setError("Bağlantı hatası.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-neutral-900 dark:text-white">
            💈 PERSONEL & EKİP YÖNETİMİ
          </h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
            Salonunuzda çalışan uzmanlarınızı ve ajanda atamalarını yönetin
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-extrabold text-xs uppercase tracking-wider shadow-sm dark:shadow-md transition-all active:scale-95"
        >
          + Yeni Personel Ekle
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-xs font-bold shadow-sm dark:shadow-gold-glow">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Personel Ekibi Yükleniyor...
          </p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="py-20 text-center text-sm text-neutral-500 dark:text-gray-400">
          Kayıtlı personel bulunamadı. Ekibinize yeni bir çalışan ekleyerek başlayın!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary/20 shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-base shrink-0 overflow-hidden">
                  {staff.avatar ? (
                    <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                  ) : (
                    staff.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">
                      {staff.name}
                    </h3>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full inline-block">
                      {staff.title || "Salon Uzmanı"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                      💰 %{staff.commissionRate ?? 0} Prim
                    </span>
                  </div>
                  {staff.phone && (
                    <p className="text-xs text-neutral-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                      📞 {staff.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-neutral-100 dark:border-white/5 pt-4">
                <span className="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  ● Aktif Çalışan
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(staff)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-all text-neutral-700 dark:text-gray-300"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-all text-red-600 dark:text-red-400"
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
                    {editingStaff ? "Personel Bilgisini Düzenle" : "Yeni Personel Ekle"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                    Randevu takvimine ve ajanda atamalarına tanımlanacak personel detayları
                  </p>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); setError(null); }}
                  className="text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="örn: Ahmet Taş"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">
                    Unvan / Uzmanlık Alanı
                  </label>
                  <input
                    type="text"
                    placeholder="örn: Kıdemli Saç Tasarımcısı / Balyaj Uzmanı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    placeholder="örn: 0532 111 22 33"
                    value={phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      setPhone(onlyNums);
                    }}
                    className="w-full px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">
                    Prim Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="örn: 20"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">
                    Profil Resmi (Avatar)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Görsel URL'i veya yükleyin"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex-1"
                    />
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold transition-all flex items-center justify-center gap-1 uppercase select-none">
                      📁 Yükle
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && tenantSlug) {
                            const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                              const response = await fetch(`${API_BASE}/api/gallery`, {
                                method: "POST",
                                headers: {
                                  "x-tenant-slug": tenantSlug,
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                                body: formData,
                              });

                              const json = await response.json();
                              if (response.ok && json.success) {
                                setAvatar(json.data.url);
                              } else {
                                alert(json.error?.message || "Görsel yüklenirken hata oluştu.");
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Bağlantı hatası: Fotoğraf yüklenemedi.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  {avatar && (
                    <div className="mt-2 w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-white/10 relative bg-neutral-100 dark:bg-white/5">
                      <img src={avatar} alt="Avatar önizleme" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(null); }}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-gray-300 text-sm font-medium transition-colors cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Kaydediliyor..." : "Kaydet"}
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
