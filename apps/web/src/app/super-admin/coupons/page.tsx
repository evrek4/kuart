"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Coupon {
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

export default function SuperAdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountAmount, setDiscountAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const getToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("kuafor-token="))?.split("=")[1];

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const response = await fetch(`${API_BASE}/api/coupons/admin`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setCoupons(json.data || []);
      } else {
        setError(json.error?.message || "Kuponlar listelenemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenirken bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountAmount) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/coupons/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountAmount: parseFloat(discountAmount),
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt || null,
        }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setSuccess("✅ Kupon başarıyla oluşturuldu.");
        setCode("");
        setDiscountAmount("");
        setMaxUses("");
        setExpiresAt("");
        fetchCoupons();
      } else {
        setError(json.error?.message || "Kupon oluşturulamadı.");
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/coupons/admin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        fetchCoupons();
      } else {
        setError(json.error?.message || "Kupon güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası.");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/coupons/admin/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await response.json();
      if (response.ok && json.success) {
        fetchCoupons();
      } else {
        setError(json.error?.message || "Kupon silinemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası.");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-10 px-4">
      {/* Title */}
      <div className="border-b border-neutral-200 dark:border-[#a78bfa]/10 pb-4">
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-wide uppercase">
          🎟️ Promosyon & İndirim Kuponu Yönetimi
        </h1>
        <p className="text-xs text-neutral-500 dark:text-[#a78bfa]/60 mt-1">
          SaaS paket alımlarında kullanılacak indirim kuponlarını tanımlayın ve denetleyin.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0c051a]/60 border border-neutral-200 dark:border-[#a78bfa]/10 rounded-3xl p-6 flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
          <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider border-b border-neutral-200 dark:border-[#a78bfa]/10 pb-2">
            🎟️ Yeni Kupon Oluştur
          </h3>

          <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4">
            {/* Kupon Kodu */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-[#a78bfa]/70">
                Kupon Kodu *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: LANSMAN50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-[#a78bfa]/20 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 uppercase font-mono tracking-wider"
              />
            </div>

            {/* İndirim Tipi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-[#a78bfa]/70">
                İndirim Türü *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-[#a78bfa]/20 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
              >
                <option value="PERCENTAGE" className="bg-white dark:bg-[#07010e] text-neutral-900 dark:text-white">Yüzde (%)</option>
                <option value="FIXED" className="bg-white dark:bg-[#07010e] text-neutral-900 dark:text-white">Sabit Tutar (TL)</option>
              </select>
            </div>

            {/* İndirim Tutarı */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-[#a78bfa]/70">
                İndirim Tutarı ({discountType === "PERCENTAGE" ? "%" : "TL"}) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder={discountType === "PERCENTAGE" ? "Örn: 20" : "Örn: 100"}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-[#a78bfa]/20 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Kullanım Limiti */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-[#a78bfa]/70">
                Kullanım Limiti (Opsiyonel)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Sınırsız için boş bırakın"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-[#a78bfa]/20 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Son Kullanma Tarihi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-[#a78bfa]/70">
                Son Kullanma Tarihi (Opsiyonel)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-[#a78bfa]/20 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-sm dark:shadow-lg"
            >
              {submitting ? "Oluşturuluyor..." : "Kupon Oluştur"}
            </button>
          </form>
        </div>

        {/* Coupons List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c051a]/60 border border-neutral-200 dark:border-[#a78bfa]/10 rounded-3xl p-6 flex flex-col gap-4 shadow-sm dark:shadow-xl transition-colors">
          <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider border-b border-neutral-200 dark:border-[#a78bfa]/10 pb-2">
            🎟️ Aktif ve Tanımlı Kuponlar
          </h3>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-neutral-500 dark:text-[#a78bfa]/60 uppercase tracking-widest">Yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-[#a78bfa]/10 bg-neutral-50 dark:bg-white/[0.01] text-[10px] font-black text-neutral-500 dark:text-[#a78bfa]/80 uppercase tracking-widest">
                    <th className="p-4">Kod</th>
                    <th className="p-4">İndirim</th>
                    <th className="p-4 text-center">Kullanım / Limit</th>
                    <th className="p-4">Son Kullanma</th>
                    <th className="p-4 text-center">Durum</th>
                    <th className="p-4 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-neutral-800 dark:text-[#eadef7]/90 divide-y divide-neutral-100 dark:divide-[#a78bfa]/5">
                  {coupons.map((c) => {
                    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                    const isLimitReached = c.maxUses !== null && c.usedCount >= c.maxUses;

                    return (
                      <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white uppercase tracking-wider">{c.code}</td>
                        <td className="p-4">
                          {c.discountType === "PERCENTAGE" ? (
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-[#a78bfa]">
                              %{c.discountAmount} İndirim
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                              {c.discountAmount} TL İndirim
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-neutral-900 dark:text-white">{c.usedCount}</span>
                          <span className="text-neutral-500 dark:text-[#a78bfa]/50"> / {c.maxUses !== null ? c.maxUses : "Sınırsız"}</span>
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-[#a78bfa]/70">
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("tr-TR") : "Süresiz"}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(c.id, c.isActive)}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                              c.isActive && !isExpired && !isLimitReached
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                            }`}
                          >
                            {isExpired
                              ? "Süresi Doldu"
                              : isLimitReached
                              ? "Tükendi"
                              : c.isActive
                              ? "Aktif"
                              : "Pasif"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="px-2 py-1 rounded-lg border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase transition-all"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-neutral-500 dark:text-[#a78bfa]/50">
                        Kayıtlı indirim kuponu bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
