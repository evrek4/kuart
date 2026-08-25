"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { MASTER_FEATURES } from "@/lib/constants/features";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  storageLimitMB: number;
  features: string[];
  isFree: boolean;
  isActive: boolean;
  maxAppointments: number | null;
  maxStaff: number | null;
}

export default function PackagesPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal States
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editStorageLimitMB, setEditStorageLimitMB] = useState(100);
  const [editIsFree, setEditIsFree] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editMaxAppointments, setEditMaxAppointments] = useState<number | ''>('');
  const [editMaxStaff, setEditMaxStaff] = useState<number | ''>('');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Create Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newStorageLimitMB, setNewStorageLimitMB] = useState(100);
  const [newIsFree, setNewIsFree] = useState(false);
  const [newIsActive, setNewIsActive] = useState(true);
  const [newMaxAppointments, setNewMaxAppointments] = useState<number | ''>('');
  const [newMaxStaff, setNewMaxStaff] = useState<number | ''>('');
  const [newFeatures, setNewFeatures] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Migration States
  const [migratingSourcePlan, setMigratingSourcePlan] = useState<SubscriptionPlan | null>(null);
  const [migrateTargetPlanId, setMigrateTargetPlanId] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);


  const fetchPlans = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/plans");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setPlans(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditPrice(plan.price);
    setEditStorageLimitMB(plan.storageLimitMB);
    setEditIsFree(plan.isFree);
    setEditIsActive(plan.isActive !== false);
    setEditMaxAppointments(plan.maxAppointments ?? '');
    setEditMaxStaff(plan.maxStaff ?? '');
    setEditFeatures(Array.isArray(plan.features) ? plan.features : []);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`http://localhost:3001/api/admin/plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          price: editPrice,
          storageLimitMB: editStorageLimitMB,
          isFree: editIsFree,
          isActive: editIsActive,
          maxAppointments: editMaxAppointments === '' ? null : Number(editMaxAppointments),
          maxStaff: editMaxStaff === '' ? null : Number(editMaxStaff),
          features: editFeatures
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPlans(plans.map(p => p.id === editingPlan.id ? json.data : p));
          setEditingPlan(null);
        }
      }
    } catch (err) {
      console.error("Failed to save plan edits:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://localhost:3001/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          price: newPrice,
          storageLimitMB: newStorageLimitMB,
          isFree: newIsFree,
          isActive: newIsActive,
          maxAppointments: newMaxAppointments === '' ? null : Number(newMaxAppointments),
          maxStaff: newMaxStaff === '' ? null : Number(newMaxStaff),
          features: newFeatures
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlans([...plans, json.data]);
        setIsCreateOpen(false);
        // Reset
        setNewName("");
        setNewPrice(0);
        setNewStorageLimitMB(100);
        setNewIsFree(false);
        setNewIsActive(true);
        setNewMaxAppointments('');
        setNewMaxStaff('');
        setNewFeatures([]);
      } else {
        setErrorMsg(json.error?.message || "Paket eklenirken hata oluştu.");
      }
    } catch (err) {
      setErrorMsg("Bağlantı hatası: Paket eklenemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async (planId: string) => {
    if (!confirm("Bu abonelik paketini silmek istediğinize emin misiniz?")) return;
    setErrorMsg(null);

    try {
      const res = await fetch(`http://localhost:3001/api/admin/plans/${planId}`, {
        method: "DELETE"
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPlans(plans.filter(p => p.id !== planId));
      } else {
        setErrorMsg(json.error?.message || "Bu pakete bağlı salonlar olduğu için silinemez. Dilerseniz vitrinde pasif yapabilirsiniz.");
      }
    } catch (err) {
      setErrorMsg("Paket silinirken hata oluştu.");
    }
  };

  const handleMigrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migratingSourcePlan || !migrateTargetPlanId) return;
    setIsMigrating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://localhost:3001/api/admin/plans/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePlanId: migratingSourcePlan.id,
          targetPlanId: migrateTargetPlanId
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        alert(json.message || "Taşıma işlemi başarıyla tamamlandı.");
        setMigratingSourcePlan(null);
        setMigrateTargetPlanId("");
      } else {
        setErrorMsg(json.error?.message || "Toplu taşıma işlemi başarısız oldu.");
      }
    } catch (err) {
      setErrorMsg("Bağlantı hatası: Toplu taşıma yapılamadı.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-neutral-900 dark:text-[#eadef7]">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-borderlight dark:border-dark-border">
        <div>
          <h1 className="text-2xl font-black text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-tight">ABONELİK PAKETLERİ</h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Salonların satın alabileceği abonelik paketlerini, vitrin durumlarını (Aktif/Pasif) ve toplu üye taşımalarını yönetin.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          + Yeni Paket Ekle
        </motion.button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`p-6 rounded-xl border bg-white dark:bg-[#081326] shadow-sm flex flex-col justify-between gap-6 relative transition-colors ${
                plan.isFree ? "border-borderlight dark:border-dark-border" : "border-[#0B1933] dark:border-white"
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-extrabold text-[#0B1933] dark:text-white">{plan.name}</h3>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                      plan.isFree ? "bg-gray-100 dark:bg-[#0A111E] text-lightText-secondary dark:text-darkText-secondary border border-borderlight dark:border-dark-border" : "bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933]"
                    }`}>
                      {plan.isFree ? "Ücretsiz" : "Ücretli"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase mt-1 ${
                      plan.isActive !== false ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }`}>
                      {plan.isActive !== false ? "Vitrinde Aktif" : "Vitrinde Pasif"}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#0B1933] dark:text-white mt-3">{plan.price} TL <span className="text-xs text-lightText-secondary dark:text-darkText-secondary font-bold">/ ay</span></div>
                
                <ul className="space-y-3 mt-6 border-t border-borderlight dark:border-dark-border pt-4 text-xs font-medium text-lightText-primary dark:text-darkText-primary">
                  <li className="flex items-center gap-2">
                    <span className="text-[#0B1933] dark:text-white">⚡</span> Kotası: <b>{plan.storageLimitMB} MB</b>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#0B1933] dark:text-white">📅</span> Max Randevu: <b>{plan.maxAppointments ?? 'Sınırsız'}</b>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#0B1933] dark:text-white">👥</span> Max Personel: <b>{plan.maxStaff ?? 'Sınırsız'}</b>
                  </li>
                  {MASTER_FEATURES.map(feat => {
                    const isIncluded = Array.isArray(plan.features) && plan.features.includes(feat.id);
                    return (
                      <li key={feat.id} className="flex items-center gap-2">
                        <span className={isIncluded ? "text-green-600 dark:text-green-400" : "text-neutral-300 dark:text-gray-600"}>
                          {isIncluded ? "✓" : "✕"}
                        </span>
                        <span className={isIncluded ? "" : "text-neutral-400 dark:text-gray-600"}>{feat.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-col gap-2 border-t border-borderlight dark:border-dark-border pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="flex-1 py-2 rounded-lg bg-gray-50 dark:bg-[#0A111E] border border-borderlight dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-highlight text-xs font-bold text-lightText-primary dark:text-darkText-primary transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteClick(plan.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 transition-colors"
                  >
                    Sil
                  </button>
                </div>
                <button
                  onClick={() => setMigratingSourcePlan(plan)}
                  className="w-full py-2 rounded-lg bg-gray-50 dark:bg-[#0A111E] border border-borderlight dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-highlight text-xs font-bold text-lightText-primary dark:text-darkText-primary transition-colors"
                >
                  👥 Üyeleri Başka Pakete Taşı
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] p-6 shadow-2xl relative text-lightText-primary dark:text-darkText-primary flex flex-col gap-6"
            >
              <button
                onClick={() => setEditingPlan(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0A111E] text-lightText-secondary dark:text-darkText-secondary"
              >
                ✕
              </button>

              <div className="border-b border-borderlight dark:border-dark-border pb-4">
                <h3 className="font-extrabold text-lg text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-wide">PAKETİ DÜZENLE</h3>
                <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-0.5">{editingPlan.name} Özellikleri</p>
              </div>

              <form onSubmit={handleEditSave} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Paket Adı *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Aylık Ücret (TL) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Depolama Kotası (MB) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editStorageLimitMB}
                      onChange={(e) => setEditStorageLimitMB(Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 justify-end">
                    <label className="flex items-center gap-2 p-3.5 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.01] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsFree}
                        onChange={(e) => setEditIsFree(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-white/5 border-neutral-300 dark:border-white/10 accent-purple-600"
                      />
                      <span className="text-neutral-700 dark:text-gray-300">Varsayılan Ücretsiz Paket</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Max Randevu / Ay (Boşsa Sınırsız)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Sınırsız"
                      value={editMaxAppointments}
                      onChange={(e) => setEditMaxAppointments(e.target.value === '' ? '' : Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Max Personel (Boşsa Sınırsız)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Sınırsız"
                      value={editMaxStaff}
                      onChange={(e) => setEditMaxStaff(e.target.value === '' ? '' : Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Active switch (vitrinde göster) */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 p-3.5 rounded-lg border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0B1933] bg-white dark:bg-dark-highlight border-borderlight dark:border-dark-border accent-[#0B1933] dark:accent-white"
                    />
                    <div>
                      <span className="font-bold block text-[11px] text-[#0B1933] dark:text-[#F7F8FA]">Vitrinde Yayında</span>
                      <span className="text-[9px] text-lightText-secondary dark:text-darkText-secondary font-medium">Bu paket fiyatlandırma ve kayıt sayfalarında kuaförlere gösterilsin.</span>
                    </div>
                  </label>
                </div>

                {/* Features toggles */}
                <div className="flex flex-col gap-2.5 mt-2 border-t border-neutral-200 dark:border-white/5 pt-4">
                  <h4 className="text-[10px] uppercase font-bold text-neutral-500 dark:text-gray-500 tracking-wider">Kapsadığı Özellikler</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {MASTER_FEATURES.map(feat => {
                      const isChecked = editFeatures.includes(feat.id);
                      return (
                        <label key={feat.id} className="flex items-center gap-2 p-2 border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.01] rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditFeatures([...editFeatures, feat.id]);
                              } else {
                                setEditFeatures(editFeatures.filter(id => id !== feat.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-white/5 border-neutral-300 dark:border-white/10 accent-purple-600"
                          />
                          <span className="text-neutral-800 dark:text-gray-300">{feat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-lg bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 shadow-sm"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Değişiklikleri Kaydet"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] p-6 shadow-2xl relative text-lightText-primary dark:text-darkText-primary flex flex-col gap-6"
            >
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0A111E] text-lightText-secondary dark:text-darkText-secondary"
              >
                ✕
              </button>

              <div className="border-b border-borderlight dark:border-dark-border pb-4">
                <h3 className="font-extrabold text-lg text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-wide">YENİ PAKET EKLE</h3>
                <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-0.5">SaaS platformu için yeni bir ücretlendirme paketi tasarlayın.</p>
              </div>

              <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Paket Adı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Gold VIP"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Aylık Ücret (TL) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="1200"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Depolama Kotası (MB) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="1000"
                      value={newStorageLimitMB}
                      onChange={(e) => setNewStorageLimitMB(Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 justify-end">
                    <label className="flex items-center gap-2 p-3.5 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.01] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsFree}
                        onChange={(e) => setNewIsFree(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-white/5 border-neutral-300 dark:border-white/10 accent-purple-600"
                      />
                      <span className="text-neutral-700 dark:text-gray-300">Varsayılan Ücretsiz Paket</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Max Randevu / Ay (Boşsa Sınırsız)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Sınırsız"
                      value={newMaxAppointments}
                      onChange={(e) => setNewMaxAppointments(e.target.value === '' ? '' : Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Max Personel (Boşsa Sınırsız)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Sınırsız"
                      value={newMaxStaff}
                      onChange={(e) => setNewMaxStaff(e.target.value === '' ? '' : Number(e.target.value))}
                      className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Create Active Checkbox */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 p-3.5 rounded-xl border border-purple-200 dark:border-[#a78bfa]/20 bg-purple-500/5 dark:bg-[#a78bfa]/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-white/5 border-neutral-300 dark:border-white/10 accent-purple-600"
                    />
                    <div>
                      <span className="font-bold block text-[11px] text-neutral-900 dark:text-white">Vitrinde Gösterilsin</span>
                      <span className="text-[9px] text-neutral-500 dark:text-gray-400 font-medium">Paket oluşturulduktan sonra fiyatlandırma listesinde doğrudan yayına alınır.</span>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col gap-2.5 mt-2 border-t border-neutral-200 dark:border-white/5 pt-4">
                  <h4 className="text-[10px] uppercase font-bold text-neutral-500 dark:text-gray-500 tracking-wider">Kapsadığı Özellikler</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {MASTER_FEATURES.map(feat => {
                      const isChecked = newFeatures.includes(feat.id);
                      return (
                        <label key={feat.id} className="flex items-center gap-2 p-2 border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.01] rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewFeatures([...newFeatures, feat.id]);
                              } else {
                                setNewFeatures(newFeatures.filter(id => id !== feat.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-white/5 border-neutral-300 dark:border-white/10 accent-purple-600"
                          />
                          <span className="text-neutral-800 dark:text-gray-300">{feat.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-lg bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 shadow-sm"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Paketi Kaydet"
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK MIGRATION MODAL */}
      <AnimatePresence>
        {migratingSourcePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] p-6 shadow-2xl relative text-lightText-primary dark:text-darkText-primary flex flex-col gap-6"
            >
              <button
                onClick={() => { setMigratingSourcePlan(null); setMigrateTargetPlanId(""); }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0A111E] text-lightText-secondary dark:text-darkText-secondary"
              >
                ✕
              </button>

              <div className="border-b border-borderlight dark:border-dark-border pb-4">
                <h3 className="font-extrabold text-lg text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-wide">👥 TOPLU ÜYE TAŞIMA</h3>
                <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-0.5">
                  <b>{migratingSourcePlan.name}</b> paketindeki tüm salon üyelerini topluca başka bir pakete aktarın.
                </p>
              </div>

              <form onSubmit={handleMigrationSubmit} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Hedef Paket Seçin *</label>
                  <select
                    required
                    value={migrateTargetPlanId}
                    onChange={(e) => setMigrateTargetPlanId(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Seçiniz</option>
                    {plans
                      .filter(p => p.id !== migratingSourcePlan.id)
                      .map(p => (
                        <option key={p.id} value={p.id} className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">
                          {p.name} ({p.price} TL/ay)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                  ⚠️ <b>ÖNEMLİ UYARI:</b> Bu işlem, kaynak paketi kullanan tüm salonların paket aboneliğini anında günceller. Geri alınamaz.
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isMigrating || !migrateTargetPlanId}
                  className="w-full py-3.5 rounded-lg bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 shadow-sm"
                >
                  {isMigrating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Salonları Topluca Taşı"
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
