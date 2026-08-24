"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  storageLimitMB: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  planId: string;
  mediaCapacity: number;
  isActive: boolean;
  billingStatus: string;
  nextBillingDate: string | null;
  plan?: SubscriptionPlan;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal States
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editQuotaMB, setEditQuotaMB] = useState(100);
  const [editPlanId, setEditPlanId] = useState("");
  const [editCustomDomain, setEditCustomDomain] = useState("");
  const [editBillingStatus, setEditBillingStatus] = useState("ACTIVE");
  const [isSaving, setIsSaving] = useState(false);

  // Create Tenant States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [newCustomDomain, setNewCustomDomain] = useState("");
  const [newPlanId, setNewPlanId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<{ name: string; email: string; password: string } | null>(null);

  // Gifting Duration States
  const [giftingTenant, setGiftingTenant] = useState<Tenant | null>(null);
  const [giftDurationType, setGiftDurationType] = useState<'DAY' | 'MONTH'>("DAY");
  const [giftAmount, setGiftAmount] = useState(1);
  const [giftNote, setGiftNote] = useState("");
  const [isGifting, setIsGifting] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/tenants");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setTenants(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch tenants:", err);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/plans");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPlans(json.data);
          if (json.data.length > 0) {
            setNewPlanId(json.data[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchTenants(), fetchPlans()]).finally(() => setIsLoading(false));
  }, []);

  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditIsActive(tenant.isActive);
    setEditQuotaMB(Math.round(tenant.mediaCapacity / (1024 * 1024)));
    setEditPlanId(tenant.planId);
    setEditCustomDomain(tenant.customDomain || "");
    setEditBillingStatus(tenant.billingStatus);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setIsSaving(true);

    try {
      const res = await fetch(`http://localhost:3001/api/admin/tenants/${editingTenant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: editIsActive,
          mediaCapacity: editQuotaMB * 1024 * 1024,
          planId: editPlanId,
          customDomain: editCustomDomain,
          billingStatus: editBillingStatus
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTenants(tenants.map(t => t.id === editingTenant.id ? { ...t, ...json.data } : t));
          setEditingTenant(null);
        }
      }
    } catch (err) {
      console.error("Failed to save tenant edits:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    setIsSaving(true);

    try {
      const res = await fetch("http://localhost:3001/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug,
          subdomain: newSubdomain || undefined,
          customDomain: newCustomDomain || undefined,
          planId: newPlanId,
          email: newEmail,
          password: newPassword
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTenants([...tenants, json.data]);
        // Başarı bilgisi — giriş credentials'ını göster
        setCreateSuccess({ name: newOwnerName || newName, email: newEmail, password: newPassword });
        // Formu sıfırla
        setNewName("");
        setNewSlug("");
        setNewSubdomain("");
        setNewCustomDomain("");
        setNewEmail("");
        setNewPassword("");
        setNewOwnerName("");
        if (plans.length > 0) {
          setNewPlanId(plans[0].id);
        }
      } else {
        setCreateError(json.error?.message || "Salon oluşturulurken hata meydana geldi.");
      }
    } catch (err) {
      setCreateError("Bağlantı hatası: Salon oluşturulamadı.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftingTenant) return;
    setIsGifting(true);

    try {
      const res = await fetch(`http://localhost:3001/api/admin/tenants/${giftingTenant.id}/gift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationType: giftDurationType,
          amount: giftAmount,
          note: giftNote
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        alert(json.message || "Hediye süresi başarıyla tanımlandı.");
        setTenants(tenants.map(t => t.id === giftingTenant.id ? { ...t, ...json.data } : t));
        setGiftingTenant(null);
        setGiftAmount(1);
        setGiftNote("");
      } else {
        alert(json.error?.message || "Hediye tanımlanırken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Süre hediye etme işlemi sırasında bağlantı hatası oluştu.");
    } finally {
      setIsGifting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-neutral-900 dark:text-[#eadef7]">
      {/* Header with New Tenant Button */}
      <div className="flex justify-between items-center pb-6 border-b border-neutral-200 dark:border-[#a78bfa]/10">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">MAĞAZA YÖNETİMİ</h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Sistemdeki tüm kuaför salonlarının limitlerini, paketlerini ve aktiflik durumlarını yönetin.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-sm dark:shadow-lg dark:shadow-pink-500/10 hover:brightness-110 transition-all"
        >
          + Yeni Kuaför Ekle
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-[#a78bfa]/10 bg-white dark:bg-[#120822]/60 shadow-sm backdrop-blur-md overflow-x-auto min-w-0 w-full">
          <table className="w-full text-left text-sm border-collapse text-neutral-800 dark:text-[#eadef7]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-4 font-bold">Salon Adı / URL</th>
                <th className="py-4 px-4 font-bold">Abonelik Paketi</th>
                <th className="py-4 px-4 font-bold">Ödeme Durumu</th>
                <th className="py-4 px-4 font-bold">Depolama Kotası</th>
                <th className="py-4 px-4 font-bold">Son Ödeme Tarihi</th>
                <th className="py-4 px-4 font-bold">Durum</th>
                <th className="py-4 px-4 font-bold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} className="border-b border-neutral-100 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-neutral-900 dark:text-white text-sm">{tenant.name}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-gray-400 font-mono mt-0.5">kuafor.art/{tenant.slug}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                      {tenant.plan?.name || "Yükleniyor..."}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      tenant.billingStatus === "ACTIVE" 
                        ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                    }`}>
                      {tenant.billingStatus === "ACTIVE" ? "Ödendi" : tenant.billingStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-neutral-700 dark:text-gray-300">
                    {Math.round(tenant.mediaCapacity / (1024 * 1024))} MB
                  </td>
                  <td className="py-4 px-4 font-semibold text-neutral-600 dark:text-gray-400">
                    {tenant.nextBillingDate ? new Date(tenant.nextBillingDate).toLocaleDateString('tr-TR') : "-"}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`w-2 h-2 rounded-full inline-block ${tenant.isActive ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-xs font-semibold ml-2 text-neutral-700 dark:text-gray-300">
                      {tenant.isActive ? "Aktif" : "Askıda"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditClick(tenant)}
                        className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-[#a78bfa]/20 bg-neutral-50 dark:bg-[#120822] hover:bg-purple-50 dark:hover:bg-purple-950 text-[11px] font-bold text-purple-700 dark:text-[#a78bfa] transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => setGiftingTenant(tenant)}
                        className="px-3 py-1.5 rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/15 text-[11px] font-bold text-pink-700 dark:text-pink-400 transition-colors flex items-center gap-1"
                      >
                        🎁 Hediye
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      <AnimatePresence>
        {editingTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[2rem] border border-neutral-200 dark:border-[#a78bfa]/20 bg-white dark:bg-[#120822] p-6 shadow-2xl relative text-neutral-900 dark:text-[#eadef7] flex flex-col gap-6"
            >
              <button
                onClick={() => setEditingTenant(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white"
              >
                ✕
              </button>

              <div className="border-b border-neutral-200 dark:border-white/5 pb-4">
                <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white uppercase tracking-wide">SALON DÜZENLE</h3>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">{editingTenant.name} / kuafor.art/{editingTenant.slug}</p>
              </div>

              <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                {/* Status Toggle */}
                <div className="flex justify-between items-center p-3 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Mağaza Hesabı Durumu</h4>
                    <p className="text-[10px] text-neutral-500 dark:text-gray-500 mt-0.5">Eğer askıya alınırsa vitrin sitesi kapanır.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-purple-600 focus:ring-0 accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Plan Assign */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Abonelik Paketi</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id} className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">
                        {plan.name} ({plan.price} TL/ay)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Fatura / Ödeme Durumu</label>
                  <select
                    value={editBillingStatus}
                    onChange={(e) => setEditBillingStatus(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="ACTIVE" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Aktif (Ödendi)</option>
                    <option value="UNPAID" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Yenilenmedi / Ödenmedi</option>
                    <option value="OVERDUE" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Vadesi Geçmiş</option>
                  </select>
                </div>

                {/* Storage Capacity limit */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Dosya Depolama Kotası (MB)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editQuotaMB}
                    onChange={(e) => setEditQuotaMB(Number(e.target.value))}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Custom Domain mapping */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Özel Alan Adı (Custom Domain)</label>
                  <input
                    type="text"
                    placeholder="örn: ahmetkuafor.com"
                    value={editCustomDomain}
                    onChange={(e) => setEditCustomDomain(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[9px] text-neutral-500 dark:text-gray-500">Müşterinin doğrudan erişim sağlayacağı DNS yönlendirmeli domain adresi.</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Ayarları Kaydet"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE TENANT MODAL DIALOG */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-[2rem] border border-neutral-200 dark:border-[#a78bfa]/20 bg-white dark:bg-[#120822] p-6 shadow-2xl relative text-neutral-900 dark:text-[#eadef7] flex flex-col gap-6"
            >
              <button
                onClick={() => { setIsCreateOpen(false); setCreateError(null); setCreateSuccess(null); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white"
              >
                ✕
              </button>

              <div className="border-b border-neutral-200 dark:border-white/5 pb-4">
                <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white uppercase tracking-wide">YENİ SALON EKLE</h3>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">Sisteme yeni bir çok-kiracılı kuaför dükkanı kaydedin.</p>
              </div>

              {createError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  ⚠️ {createError}
                </div>
              )}

              {/* Başarı mesajı + giriş bilgileri */}
              {createSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-xs font-semibold flex flex-col gap-2"
                >
                  <p className="font-black text-green-700 dark:text-green-400">✅ Salon başarıyla oluşturuldu!</p>
                  <p className="text-neutral-700 dark:text-gray-300">
                    <strong>{createSuccess.name}</strong> adlı yetkili kullanıcı aşağıdaki bilgilerle
                    <a href="/login" className="text-purple-600 dark:text-[#a78bfa] underline mx-1">/login</a>
                    adresinden giriş yapabilir:
                  </p>
                  <div className="mt-1 p-3 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 font-mono text-[11px] flex flex-col gap-1">
                    <span>E-Posta: <span className="text-pink-600 dark:text-pink-400">{createSuccess.email}</span></span>
                    <span>Şifre: <span className="text-pink-600 dark:text-pink-400">{createSuccess.password}</span></span>
                  </div>
                  <button
                    onClick={() => { setIsCreateOpen(false); setCreateSuccess(null); }}
                    className="mt-2 w-full py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/20 text-green-800 dark:text-green-300 font-bold transition-colors"
                  >
                    Tamam, Kapat
                  </button>
                </motion.div>
              )}

              {!createSuccess && (
                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Salon Adı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Salon Efsane"
                      value={newName}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        // Slug otomatik üret
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                      }}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Slug (URL Kökü) *</label>
                      <input
                        type="text"
                        required
                        placeholder="efsane"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Alt Alan Adı (Subdomain)</label>
                      <input
                        type="text"
                        placeholder="efsane"
                        value={newSubdomain}
                        onChange={(e) => setNewSubdomain(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* YENİ: Yetkili Giriş Bilgileri */}
                  <div className="p-3.5 rounded-2xl bg-purple-500/5 dark:bg-[#a78bfa]/5 border border-purple-200 dark:border-[#a78bfa]/15 flex flex-col gap-3">
                    <p className="text-[10px] uppercase font-black text-purple-700 dark:text-[#a78bfa] tracking-wider">🔐 Yetkili Giriş Bilgileri</p>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Yetkili E-Posta *</label>
                      <input
                        type="email"
                        required
                        placeholder="ahmet@efsanesalon.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Geçici Şifre *</label>
                      <input
                        type="text"
                        required
                        minLength={5}
                        placeholder="GeciciSifre123"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <p className="text-[9px] text-neutral-500 dark:text-gray-500">Salon yöneticisi giriş yaptıktan sonra şifresini değiştirmelidir.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Abonelik Paketi</label>
                    <select
                      value={newPlanId}
                      onChange={(e) => setNewPlanId(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id} className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">
                          {plan.name} ({plan.price} TL/ay)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Özel Alan Adı</label>
                    <input
                      type="text"
                      placeholder="örn: efsanesalon.com"
                      value={newCustomDomain}
                      onChange={(e) => setNewCustomDomain(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4 shadow-sm"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Salon Hesabı Oluştur"
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GIFT DURATION MODAL */}
      <AnimatePresence>
        {giftingTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[2rem] border border-neutral-200 dark:border-[#a78bfa]/20 bg-white dark:bg-[#120822] p-6 shadow-2xl relative text-neutral-900 dark:text-[#eadef7] flex flex-col gap-6"
            >
              <button
                onClick={() => { setGiftingTenant(null); setGiftAmount(1); setGiftNote(""); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white"
              >
                ✕
              </button>

              <div className="border-b border-neutral-200 dark:border-white/5 pb-4">
                <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white uppercase tracking-wide">🎁 PAKET SÜRESİ HEDİYE ET</h3>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">{giftingTenant.name} salonuna kullanım süresi hediye edin.</p>
              </div>

              <form onSubmit={handleGiftSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Süre Türü</label>
                    <select
                      value={giftDurationType}
                      onChange={(e) => setGiftDurationType(e.target.value as 'DAY' | 'MONTH')}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="DAY" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Gün</option>
                      <option value="MONTH" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Ay</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Miktar</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Özel Not (Opsiyonel)</label>
                  <textarea
                    rows={3}
                    placeholder="Kampanya katılım hediyesi veya telafi..."
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isGifting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 shadow-sm dark:shadow-lg"
                >
                  {isGifting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Hediye Süreyi Tanımla"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
