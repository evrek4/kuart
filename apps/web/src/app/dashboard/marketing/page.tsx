"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentTenantInfo } from "@/lib/auth";

interface CustomerCRM {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  birthDate: string | null;
  loyaltyStamps: number;
  lastAppointmentAt: string | null;
  lastMarketingSentAt: string | null;
}

interface TenantSettings {
  enableReengagementBot: boolean;
  reengagementDays: number;
  enableBirthdayBot: boolean;
  enableLoyaltySystem: boolean;
  loyaltyTargetStamps: number;
  loyaltyRewardText: string;
}

interface TenantCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function MarketingPage() {
  const router = useRouter();

  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"AUTOMATION" | "COUPONS" | "LOYALTY">("AUTOMATION");

  // Settings states
  const [settings, setSettings] = useState<TenantSettings>({
    enableReengagementBot: true,
    reengagementDays: 35,
    enableBirthdayBot: true,
    enableLoyaltySystem: true,
    loyaltyTargetStamps: 10,
    loyaltyRewardText: "1 Bakım Ücretsiz",
  });

  // CRM Data & Coupons Data
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [coupons, setCoupons] = useState<TenantCoupon[]>([]);
  
  // Coupon Modal States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState("");
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const getToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("kuafor-token="))?.split("=")[1];

  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/marketing");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const headers = {
        "x-tenant-slug": tenantSlug,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [resSettings, resCustomers, resCoupons] = await Promise.all([
        fetch(`${API_BASE}/api/appointments/settings`, { headers }),
        fetch(`${API_BASE}/api/customers`, { headers }),
        fetch(`${API_BASE}/api/tenant-coupons`, { headers }),
      ]);

      if (resSettings.ok) {
        const json = await resSettings.json();
        if (json.success && json.data) {
          setSettings({
            enableReengagementBot: json.data.enableReengagementBot !== undefined ? json.data.enableReengagementBot : true,
            reengagementDays: json.data.reengagementDays || 35,
            enableBirthdayBot: json.data.enableBirthdayBot !== undefined ? json.data.enableBirthdayBot : true,
            enableLoyaltySystem: json.data.enableLoyaltySystem !== undefined ? json.data.enableLoyaltySystem : true,
            loyaltyTargetStamps: json.data.loyaltyTargetStamps || 10,
            loyaltyRewardText: json.data.loyaltyRewardText || "1 Bakım Ücretsiz",
          });
        }
      }

      if (resCustomers.ok) {
        const json = await resCustomers.json();
        if (json.success) {
          setCustomers(json.data || []);
        }
      }

      if (resCoupons.ok) {
        const json = await resCoupons.json();
        if (json.success) {
          setCoupons(json.data || []);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenirken bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, API_BASE]);

  useEffect(() => {
    if (authReady && tenantSlug) {
      fetchData();
    }
  }, [authReady, tenantSlug, fetchData]);

  // Ayarları Kaydet
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) return;

    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/appointments/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setSuccess("✅ Ayarlar başarıyla kaydedildi!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(json.error?.message || "Ayarlar kaydedilemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Yeni Kupon Oluştur
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug || !couponCode || discountAmount === "") return;

    setCouponSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/tenant-coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: couponCode,
          discountType,
          discountAmount: Number(discountAmount),
          maxUses: maxUses !== "" ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setCoupons([json.data, ...coupons]);
        setIsCouponModalOpen(false);
        setCouponCode("");
        setDiscountAmount("");
        setMaxUses("");
        setExpiresAt("");
        setSuccess("✅ Kupon başarıyla oluşturuldu!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(json.error?.message || "Kupon oluşturulamadı.");
      }
    } catch (err) {
      console.error(err);
      setError("Kupon oluşturulurken bağlantı hatası oluştu.");
    } finally {
      setCouponSubmitting(false);
    }
  };

  // Kupon Durumu Değiştir
  const handleToggleCoupon = async (coupon: TenantCoupon) => {
    if (!tenantSlug) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/tenant-coupons/${coupon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c)));
      }
    } catch (err) {
      console.error("Toggle coupon error:", err);
    }
  };

  // Kupon Sil
  const handleDeleteCoupon = async (id: string) => {
    if (!tenantSlug || !confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/tenant-coupons/${id}`, {
        method: "DELETE",
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
        setSuccess("Kupon silindi.");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Delete coupon error:", err);
    }
  };

  // Performance calculations
  const calculatePerformance = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const marketingSentThisMonth = customers.filter((c) => {
      if (!c.lastMarketingSentAt) return false;
      const d = new Date(c.lastMarketingSentAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const birthdayCount = customers.filter((c) => {
      if (!c.birthDate) return false;
      const d = new Date(c.birthDate);
      return d.getMonth() === currentMonth;
    }).length;

    const rewardsDistributed = customers.filter((c) => c.loyaltyStamps === 0 && c.lastAppointmentAt).length;

    return {
      reengaged: marketingSentThisMonth,
      birthdays: birthdayCount,
      rewards: rewardsDistributed,
    };
  };

  const stats = calculatePerformance();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 text-neutral-900 dark:text-white">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-neutral-900 dark:text-white">
            📣 PAZARLAMA & MÜŞTERİ BAĞLILIĞI
          </h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
            Otomasyon botları, salon indirim kuponları ve dijital sadakat sistemini yönetin
          </p>
        </div>

        {/* Sekme Seçiciler */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("AUTOMATION")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "AUTOMATION"
                ? "bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            🤖 Botlar & Özet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COUPONS")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "COUPONS"
                ? "bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            🎟️ İndirim Kuponları ({coupons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LOYALTY")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "LOYALTY"
                ? "bg-white dark:bg-[#1C1C1E] text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            💎 Sadakat & Damga
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-xs font-bold shadow-sm">
          {success}
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
          <p className="text-xs text-gray-500 uppercase tracking-widest">Veriler Yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OTOMASYON & BOTLAR */}
          {activeTab === "AUTOMATION" && (
            <div className="flex flex-col gap-6">
              {/* Performance Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-neutral-200 dark:border-white/5 p-5 relative overflow-hidden">
                  <span className="text-[10px] font-black text-neutral-500 dark:text-gray-400 uppercase tracking-widest">
                    Geri Çağrılan Müşteri
                  </span>
                  <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-2">{stats.reengaged}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-1">Bu ay otomatik davet iletilenler</p>
                  <span className="absolute top-4 right-4 text-xl opacity-20">✂️</span>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-neutral-200 dark:border-white/5 p-5 relative overflow-hidden">
                  <span className="text-[10px] font-black text-neutral-500 dark:text-gray-400 uppercase tracking-widest">
                    Kutlanan Doğum Günü
                  </span>
                  <h3 className="text-3xl font-black text-primary mt-2">{stats.birthdays}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-1">Bu ay doğum günü kutlananlar</p>
                  <span className="absolute top-4 right-4 text-xl opacity-20">🎂</span>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-neutral-200 dark:border-white/5 p-5 relative overflow-hidden">
                  <span className="text-[10px] font-black text-neutral-500 dark:text-gray-400 uppercase tracking-widest">
                    Aktif Salon Kuponu
                  </span>
                  <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    {coupons.filter((c) => c.isActive).length}
                  </h3>
                  <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-1">Kullanıma hazır indirim kodu</p>
                  <span className="absolute top-4 right-4 text-xl opacity-20">🎟️</span>
                </div>
              </div>

              {/* Bot Ayarları Formu */}
              <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-neutral-200 dark:border-white/5 p-6 flex flex-col gap-5">
                <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider border-b border-neutral-200 dark:border-white/5 pb-2">
                  🤖 Otomasyon & Hatırlatıcı Botları
                </h3>

                <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Re-engagement Bot */}
                  <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Geri Çağrı (Re-engagement) Botu
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-gray-400">
                          Uzun süre gelmeyen müşterilere otomatik WhatsApp/SMS gönderir.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableReengagementBot}
                        onChange={(e) =>
                          setSettings({ ...settings, enableReengagementBot: e.target.checked })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                    {settings.enableReengagementBot && (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                          Hareketsizlik Gün Eşiği (Örn: 35 Gün)
                        </label>
                        <input
                          type="number"
                          min="7"
                          max="180"
                          value={settings.reengagementDays}
                          onChange={(e) =>
                            setSettings({ ...settings, reengagementDays: parseInt(e.target.value) || 35 })
                          }
                          className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Birthday Bot */}
                  <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Doğum Günü Kutlama Botu
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-gray-400">
                          Doğum gününde müşterilere özel kutlama ve indirim tebriği iletir.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableBirthdayBot}
                        onChange={(e) =>
                          setSettings({ ...settings, enableBirthdayBot: e.target.checked })
                        }
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm disabled:opacity-50"
                    >
                      {saving ? "Kaydediliyor..." : "Bot Ayarlarını Kaydet"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: SALON İÇİ İNDİRİM KUPONLARI */}
          {activeTab === "COUPONS" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                    🎟️ Salon İçi İndirim Kuponları
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">
                    Müşterilerinizin vitrinden randevu alırken kullanabileceği promosyon kodları
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>+</span> Yeni Kupon Oluştur
                </button>
              </div>

              {/* Kupon Listesi Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className={`bg-white dark:bg-[#121212] rounded-3xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                      coupon.isActive
                        ? "border-neutral-200 dark:border-white/10 shadow-sm"
                        : "border-neutral-200/50 dark:border-white/5 opacity-60 bg-neutral-50/50 dark:bg-white/[0.01]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm tracking-wider font-mono">
                            {coupon.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              coupon.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-neutral-500/10 text-neutral-500 border border-neutral-500/20"
                            }`}
                          >
                            {coupon.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-neutral-400 hover:text-red-500 text-xs p-1 transition-colors"
                          title="Kuponu Sil"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-1.5">
                        <div className="text-xl font-black text-neutral-900 dark:text-white">
                          {coupon.discountType === "PERCENTAGE"
                            ? `%${coupon.discountAmount} İndirim`
                            : `${coupon.discountAmount} TL Sabit İndirim`}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-gray-400 flex items-center gap-2">
                          <span>📊 Kullanım: <b>{coupon.usedCount}</b> {coupon.maxUses ? `/ ${coupon.maxUses}` : "(Sınırsız)"}</span>
                        </div>
                        {coupon.expiresAt && (
                          <div className="text-[10px] text-neutral-400 dark:text-gray-500 mt-1">
                            ⏳ Son Kullanma: {new Date(coupon.expiresAt).toLocaleDateString("tr-TR")}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500 dark:text-gray-400 font-semibold">
                        Durum Değiştir
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(coupon)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          coupon.isActive
                            ? "bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-gray-300 hover:bg-neutral-200"
                            : "bg-primary text-white hover:brightness-110"
                        }`}
                      >
                        {coupon.isActive ? "Durdur" : "Aktifleştir"}
                      </button>
                    </div>
                  </div>
                ))}

                {coupons.length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl bg-neutral-50/50 dark:bg-white/[0.01]">
                    <span className="text-3xl">🎟️</span>
                    <h4 className="font-extrabold text-sm text-neutral-800 dark:text-gray-300 mt-2">
                      Henüz salon kuponu oluşturulmadı
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-gray-500 mt-1">
                      Müşterilerinize randevularda indirim sunmak için hemen bir kupon kodu oluşturun.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCouponModalOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm"
                    >
                      İlk Kuponu Oluştur
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DİJİTAL SADAKAT & DAMGA KARTI */}
          {activeTab === "LOYALTY" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Sadakat Kuralı Ayarları */}
              <div className="lg:col-span-1 bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-neutral-200 dark:border-white/5 p-5 flex flex-col gap-5">
                <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider border-b border-neutral-200 dark:border-white/5 pb-2">
                  💎 Sadakat Kuralı Ayarları
                </h3>

                <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        Sadakat Sistemi Aktif
                      </span>
                      <span className="text-[10px] text-neutral-500 dark:text-gray-400">
                        Her tamamlanan randevuda müşteriye damga verilir.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableLoyaltySystem}
                      onChange={(e) =>
                        setSettings({ ...settings, enableLoyaltySystem: e.target.checked })
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </div>

                  {settings.enableLoyaltySystem && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                          Hedef Damga Sayısı (Örn: 10)
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="20"
                          value={settings.loyaltyTargetStamps}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              loyaltyTargetStamps: parseInt(e.target.value) || 10,
                            })
                          }
                          className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                          Kazanılacak Ödül Metni
                        </label>
                        <input
                          type="text"
                          value={settings.loyaltyRewardText}
                          onChange={(e) =>
                            setSettings({ ...settings, loyaltyRewardText: e.target.value })
                          }
                          placeholder="Örn: 1 Saç Bakımı Ücretsiz"
                          className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-primary text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm disabled:opacity-50"
                  >
                    {saving ? "Kaydediliyor..." : "Sadakat Ayarlarını Kaydet"}
                  </button>
                </form>
              </div>

              {/* Müşteri Sadakat Durum Tablosu */}
              <div className="lg:col-span-2 bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-neutral-200 dark:border-white/5 p-5 flex flex-col gap-4">
                <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider border-b border-neutral-200 dark:border-white/5 pb-2">
                  👥 Müşteri Sadakat Kartı Durumları (CRM)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-white/5 text-[9px] uppercase text-neutral-500 dark:text-gray-400 tracking-wider">
                        <th className="pb-3 pl-2">Müşteri</th>
                        <th className="pb-3">Son Randevu</th>
                        <th className="pb-3 text-center">Damga İlerlemesi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-white/[0.04]">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 pl-2">
                            <div className="font-bold text-neutral-900 dark:text-white text-xs">{c.name}</div>
                            <div className="text-[10px] text-neutral-500 dark:text-gray-400 mt-0.5">{c.phone}</div>
                          </td>
                          <td className="py-3 text-xs text-neutral-700 dark:text-gray-300">
                            {c.lastAppointmentAt
                              ? new Date(c.lastAppointmentAt).toLocaleDateString("tr-TR")
                              : "Kayıtlı randevu yok"}
                          </td>
                          <td className="py-3 text-center">
                            {settings.enableLoyaltySystem ? (
                              <div className="flex flex-col gap-1.5 items-center justify-center">
                                <div className="flex gap-1.5 justify-center flex-wrap max-w-xs">
                                  {Array.from({ length: settings.loyaltyTargetStamps }).map((_, idx) => (
                                    <span
                                      key={idx}
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black leading-none ${
                                        idx < c.loyaltyStamps
                                          ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                          : "bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-transparent"
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                                  {c.loyaltyStamps} / {settings.loyaltyTargetStamps} Damga
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-neutral-400 dark:text-gray-500 italic">Pasif</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-neutral-500 dark:text-gray-500">
                            Kayıtlı müşteri bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* YENİ KUPON OLUŞTURMA MODALI */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18181B] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5"
            >
              <div className="flex justify-between items-center border-b border-neutral-100 dark:border-white/5 pb-3">
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  🎟️ Yeni Salon Kuponu
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                    Kupon Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: YAZ2026, SALON20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                      İndirim Türü *
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      <option value="PERCENTAGE" className="bg-white dark:bg-[#18181B] text-neutral-900 dark:text-white">Yüzde (%)</option>
                      <option value="FIXED" className="bg-white dark:bg-[#18181B] text-neutral-900 dark:text-white">Sabit Tutar (TL)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                      İndirim Değeri *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={discountType === "PERCENTAGE" ? "20 (%)" : "100 (TL)"}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                      Maksimum Kullanım
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Sınırsız için boş bırakın"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value === "" ? "" : Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-gray-400">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={couponSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {couponSubmitting ? "Oluşturuluyor..." : "Kuponu Kaydet"}
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
