"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCurrentTenantInfo } from "@/lib/auth";
import { revalidateStorefront } from "@/app/revalidate-actions";

interface WorkingDay {
  isOpen: boolean;
  start: string;
  end: string;
}

interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

const defaultWorkingHours: WorkingHours = {
  monday: { isOpen: true, start: "09:00", end: "20:00" },
  tuesday: { isOpen: true, start: "09:00", end: "20:00" },
  wednesday: { isOpen: true, start: "09:00", end: "20:00" },
  thursday: { isOpen: true, start: "09:00", end: "20:00" },
  friday: { isOpen: true, start: "09:00", end: "20:00" },
  saturday: { isOpen: true, start: "09:00", end: "20:00" },
  sunday: { isOpen: false, start: "09:00", end: "20:00" },
};

interface Settings {
  themeTemplate: string;
  portalThemeTier: "BASIC" | "GOLD" | "PREMIUM";
  portalColorMode: "DARK" | "LIGHT";
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  instagramUrl: string;
  coverImage: string;
  logo: string;
  globalPaymentPolicy: string;
  requiredDepositAmount: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  preferredNotificationChannel: string;
  storefrontMode: string;
  selectedThemeId: string;
  workingHours: WorkingHours;
}

export default function SettingsPage() {
  const router = useRouter();

  // Tenant bilgisi JWT'den okunur — hardcoded değil
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("Salonum");
  const [tenantPlan, setTenantPlan] = useState<string>("FREE");
  const [authReady, setAuthReady] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    themeTemplate: "template-minimalist",
    portalThemeTier: "BASIC",
    portalColorMode: "DARK",
    heroTitle: "",
    heroSubtitle: "",
    aboutText: "",
    instagramUrl: "",
    coverImage: "",
    logo: "",
    globalPaymentPolicy: "DEPOSIT",
    requiredDepositAmount: 150,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    preferredNotificationChannel: "WHATSAPP",
    storefrontMode: "SIMPLE",
    selectedThemeId: "SIMPLE_MINIMALIST",
    workingHours: defaultWorkingHours,
  });

  const [allowPortalThemes, setAllowPortalThemes] = useState(false);
  const [activeThemeTab, setActiveThemeTab] = useState<"SIMPLE" | "PORTAL">("SIMPLE");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  // JWT'den tenant bilgisini oku
  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/settings");
      return;
    }
    setTenantSlug(info.tenantSlug);

    async function fetchName() {
      if (!info?.tenantSlug) { setAuthReady(true); return; }
      try {
        const res = await fetch(`${API_BASE}/api/storefront/${info.tenantSlug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.tenant) {
            if (json.data.tenant.name) setTenantName(json.data.tenant.name.toUpperCase());
            const planStr = typeof json.data.tenant.plan === "string" 
              ? json.data.tenant.plan.toUpperCase() 
              : json.data.tenant.plan?.name?.toUpperCase() || "FREE";
            setTenantPlan(planStr);
            if (planStr === "ELITE" || planStr === "PRO" || json.data.tenant.allowPortalThemes) {
              setAllowPortalThemes(true);
            }
          }
        }
      } catch { /* sessiz */ } finally { setAuthReady(true); }
    }
    fetchName();
  }, [router, API_BASE]);

  useEffect(() => {
    if (!authReady || !tenantSlug) return;
    async function loadSettings() {
      try {
        setLoading(true);
        const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
        const response = await fetch(`${API_BASE}/api/appointments/settings`, {
          headers: {
            "x-tenant-slug": tenantSlug!,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const json = await response.json();
        if (response.ok && json.success) {
          const planStr = typeof json.data.plan === "string" 
            ? json.data.plan.toUpperCase() 
            : json.data.plan?.name?.toUpperCase() || "FREE";
          setTenantPlan(planStr);
          
          if (planStr === "ELITE" || planStr === "PRO" || json.data.allowPortalThemes) {
            setAllowPortalThemes(true);
          }

          const currentThemeId = json.data.selectedThemeId || "SIMPLE_MINIMALIST";
          const currentStorefrontMode = json.data.storefrontMode || "SIMPLE";

          if (currentThemeId.startsWith("PORTAL") || currentStorefrontMode === "PRO_PORTAL") {
            setActiveThemeTab("PORTAL");
          }

          setSettings({
            themeTemplate: json.data.themeTemplate || "template-minimalist",
            portalThemeTier: json.data.portalThemeTier || "BASIC",
            portalColorMode: json.data.portalColorMode || "DARK",
            heroTitle: json.data.heroTitle || "",
            heroSubtitle: json.data.heroSubtitle || "",
            aboutText: json.data.aboutText || "",
            instagramUrl: json.data.instagramUrl || "",
            coverImage: json.data.coverImage || "",
            logo: json.data.logo || "",
            globalPaymentPolicy: json.data.globalPaymentPolicy || "DEPOSIT",
            requiredDepositAmount: Number(json.data.requiredDepositAmount) || 0,
            emailEnabled: json.data.emailEnabled !== false,
            smsEnabled: !!json.data.smsEnabled,
            whatsappEnabled: !!json.data.whatsappEnabled,
            preferredNotificationChannel: json.data.preferredNotificationChannel || "WHATSAPP",
            storefrontMode: currentStorefrontMode,
            selectedThemeId: currentThemeId,
            workingHours: json.data.workingHours || defaultWorkingHours
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [API_BASE, tenantSlug, authReady]);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUploadImage = async (file: File, type: "cover" | "logo") => {
    if (!tenantSlug) return;
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
        const uploadedUrl = json.data.url;
        setSettings(prev => ({
          ...prev,
          [type === "cover" ? "coverImage" : "logo"]: uploadedUrl
        }));
        triggerNotification(type === "cover" ? "Kapak fotoğrafı başarıyla yüklendi." : "Logo başarıyla yüklendi.");
      } else {
        triggerNotification(json.error?.message || "Görsel yüklenirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Bağlantı hatası: Fotoğraf yüklenemedi.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlug) return;
    setSaving(true);

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const response = await fetch(`${API_BASE}/api/appointments/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings)
      });
      const json = await response.json();
      if (response.ok && json.success) {
        triggerNotification("Salon ayarları başarıyla kaydedildi.");
        toast.success("Salon ayarları başarıyla kaydedildi!", {
          description: "Vitrin sayfanız güncelleniyor...",
          duration: 4000,
        });
        // [PHASE 5] Vitrin cache'ini temizle — eski veri gösterilmesin
        await revalidateStorefront(tenantSlug);
      } else {
        const errMsg = json.error?.message || "Ayarlar kaydedilirken hata oluştu.";
        triggerNotification(errMsg);
        toast.error(errMsg, { duration: 5000 });
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      const errMsg = "Bağlantı hatası: Ayarlar kaydedilemedi.";
      triggerNotification(errMsg);
      toast.error(errMsg, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-gray-400">Ayarlar Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 dark:text-[#F5F5F5] font-sans px-4 py-8 md:px-8 max-w-5xl mx-auto flex flex-col gap-8 relative transition-colors duration-200">
      {/* Glow backgrounds */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Floating notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full border border-primary/30 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md text-primary font-semibold text-sm shadow-sm dark:shadow-gold-glow flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-between items-center pb-6 border-b border-neutral-200 dark:border-white/5"
      >
        <div>
          <div className="flex items-center gap-3">
            {/* Dinamik salon adı — JWT'den okunuyor, hardcoded değil */}
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{tenantName}</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-primary/10 border border-primary/20 text-primary uppercase shadow-sm dark:shadow-gold-glow">
              AYARLAR
            </span>
          </div>
          <p className="text-neutral-500 dark:text-gray-400 text-sm mt-1">Ödeme Politikası, Vitrin CMS Ayarları ve Bildirimler</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-full border border-neutral-200 dark:border-white/10 hover:border-primary/50 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:text-primary transition-all duration-300 bg-neutral-100 dark:bg-white/5"
            >
              ← Kontrol Paneli
            </motion.button>
          </Link>
        </div>
      </motion.header>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* SITE BUILDER: TEMALAR */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-200 dark:border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide">Vitrin Görünümü (Site Builder)</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Yeni
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                Salonunuzun web sitesi için bir tema seçin.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-xs text-neutral-700 dark:text-gray-300 font-bold self-start md:self-auto">
              Paketiniz: <span className="text-primary font-black">{tenantPlan}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-neutral-200 dark:border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setActiveThemeTab("SIMPLE")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeThemeTab === "SIMPLE"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800"
              }`}
            >
              ⚡ Hızlı Randevu Temaları
            </button>
            <button
              type="button"
              onClick={() => setActiveThemeTab("PORTAL")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                activeThemeTab === "PORTAL"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:hover:bg-neutral-800"
              }`}
            >
              🏛️ Kurumsal Portal Temaları
            </button>
          </div>

          {activeThemeTab === "SIMPLE" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "SIMPLE_MINIMALIST", name: "Minimalist", desc: "Sade ve hızlı randevu." },
                { id: "SIMPLE_MODERN_DARK", name: "Modern Dark", desc: "Siyah mod odaklı dinamik." },
                { id: "SIMPLE_LUXURY_COMPACT", name: "Luxury Compact", desc: "Şık altın vurgulu." }
              ].map(theme => {
                const isSelected = settings.selectedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setSettings(prev => ({ ...prev, storefrontMode: "SIMPLE", selectedThemeId: theme.id }))}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                      isSelected
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm text-neutral-900 dark:text-white"
                        : "border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:bg-gray-50 dark:hover:bg-white/[0.02] text-neutral-700 dark:text-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">{theme.name}</h3>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-gray-400 mt-2">{theme.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[10px] flex justify-end items-center">
                      {isSelected ? (
                        <span className="px-3 py-1 rounded-lg font-black uppercase tracking-wider text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                          ✓ SEÇİLİ
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 border border-gray-200 dark:border-white/10 transition-colors">
                          SEÇ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeThemeTab === "PORTAL" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {!allowPortalThemes && (
                <div className="absolute inset-0 z-10 bg-white/85 dark:bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl border border-neutral-200 dark:border-white/10 p-6">
                  <span className="text-4xl mb-4">🔒</span>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Kilitli (Pro/Elite Paket Gerektirir)</h3>
                  <p className="text-neutral-600 dark:text-gray-300 text-sm mb-6 text-center px-4">Kurumsal portal temaları yalnızca ücretli abonelik paketlerinde kullanılabilir.</p>
                  <Link
                    href="/dashboard/billing"
                    className="relative z-20 inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer select-none"
                  >
                    Paket Yükselt
                  </Link>
                </div>
              )}
              {[
                { id: "PORTAL_BASIC", name: "Basic Portal", desc: "Standart & Şık." },
                { id: "PORTAL_GOLD", name: "Gold Portal", desc: "Lüks & Animasyonlu." },
                { id: "PORTAL_PREMIUM", name: "Premium Portal", desc: "Ultra-Lüks & Asimetrik Grid." }
              ].map(theme => {
                const isSelected = settings.selectedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      if (allowPortalThemes) {
                        setSettings(prev => ({ ...prev, storefrontMode: "PRO_PORTAL", selectedThemeId: theme.id }));
                      }
                    }}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
                      isSelected
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm text-neutral-900 dark:text-white"
                        : "border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-neutral-700 dark:text-gray-300"
                    } ${allowPortalThemes ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]" : "opacity-50 grayscale"}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">{theme.name}</h3>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-gray-400 mt-2">{theme.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[10px] flex justify-end items-center">
                      {isSelected ? (
                        <span className="px-3 py-1 rounded-lg font-black uppercase tracking-wider text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                          ✓ SEÇİLİ
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                          {allowPortalThemes ? "SEÇ" : "KİLİTLİ"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CMS DIGITAL IDENTITY DETAILS */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide">Vitrin İçerik Ayarları (CMS)</h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Vitrin sayfanızın metin içeriklerini ve kapak görselini kişiselleştirin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Karşılama Başlığı (Hero Title)</label>
              <input
                type="text"
                placeholder="MELEK SAÇ TASARIMI"
                value={settings.heroTitle}
                onChange={e => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Alt Açıklama (Hero Subtitle)</label>
              <input
                type="text"
                placeholder="Kişiye Özel Premium Stil Deneyimi"
                value={settings.heroSubtitle}
                onChange={e => setSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Instagram Profil Adresi</label>
              <input
                type="url"
                placeholder="https://instagram.com/kuaforunuz"
                value={settings.instagramUrl}
                onChange={e => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Logo / Profil Görseli</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={settings.logo}
                  onChange={e => setSettings(prev => ({ ...prev, logo: e.target.value }))}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex-1"
                />
                <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold transition-all flex items-center justify-center gap-1 uppercase select-none">
                  📁 Yükle
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file, "logo");
                    }}
                  />
                </label>
              </div>
              {settings.logo && (
                <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 relative bg-neutral-100 dark:bg-white/5">
                  <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Kapak Fotoğrafı URL'i</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={settings.coverImage}
                  onChange={e => setSettings(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex-1"
                />
                <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-bold transition-all flex items-center justify-center gap-1 uppercase select-none">
                  📁 Yükle
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file, "cover");
                    }}
                  />
                </label>
              </div>
              {settings.coverImage && (
                <div className="mt-2 aspect-[16/9] w-32 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 relative bg-neutral-100 dark:bg-white/5">
                  <img src={settings.coverImage} alt="Kapak Fotoğrafı" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Hakkımızda / Hikayemiz Yazısı</label>
              <textarea
                rows={4}
                placeholder="Salonunuzun tarihçesi, vizyonu ve kalitesine dair bilgiler..."
                value={settings.aboutText}
                onChange={e => setSettings(prev => ({ ...prev, aboutText: e.target.value }))}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT POLICY & DEPOSITS */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide">Ödeme ve Kapora Politikası</h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Müşteri randevuları için geçerli olacak genel finansal politikayı belirleyin.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-xs uppercase font-bold text-neutral-600 dark:text-gray-400">Genel Ödeme Politikası</label>
              <select
                value={settings.globalPaymentPolicy}
                onChange={e => setSettings(prev => ({ ...prev, globalPaymentPolicy: e.target.value }))}
                className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DEPOSIT" className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">💳 Sadece Sabit Kapora Al</option>
                <option value="FULL_PRICE" className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">💰 Tüm Ücreti Peşin Al</option>
                <option value="NONE" className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">🤝 Sistemden Ücret Alma (Salonda Elden)</option>
              </select>
            </div>

            <AnimatePresence>
              {settings.globalPaymentPolicy === "DEPOSIT" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden flex flex-col gap-1.5 max-w-xs mt-1"
                >
                  <label className="text-xs uppercase font-bold text-neutral-600 dark:text-gray-400">Sabit Kapora Bedeli (TL)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={settings.requiredDepositAmount}
                    onChange={e => setSettings(prev => ({ ...prev, requiredDepositAmount: Number(e.target.value) }))}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Örn: 150"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* WEEKLY WORKING HOURS */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide">
              📅 Haftalık Çalışma Günleri & Saatleri
            </h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
              Salonunuzun açık olduğu günleri, açılış ve kapanış saatlerini belirleyin. Vitrindeki randevu takvimi bu saatleri baz alır.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-neutral-200 dark:divide-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-white/[0.01]">
            {[
              { key: "monday" as const, label: "Pazartesi" },
              { key: "tuesday" as const, label: "Salı" },
              { key: "wednesday" as const, label: "Çarşamba" },
              { key: "thursday" as const, label: "Perşembe" },
              { key: "friday" as const, label: "Cuma" },
              { key: "saturday" as const, label: "Cumartesi" },
              { key: "sunday" as const, label: "Pazar" },
            ].map((day) => {
              const dayData = settings.workingHours?.[day.key] || defaultWorkingHours[day.key];
              return (
                <div
                  key={day.key}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-100/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 w-40">
                    <input
                      type="checkbox"
                      checked={dayData.isOpen}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSettings((prev) => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day.key]: {
                              ...dayData,
                              isOpen: checked,
                            },
                          },
                        }));
                      }}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-white/10 text-primary accent-primary cursor-pointer"
                    />
                    <span className={`text-xs font-bold ${dayData.isOpen ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-gray-500"}`}>
                      {day.label}
                    </span>
                  </div>

                  {dayData.isOpen ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-gray-400">Açılış:</span>
                        <input
                          type="time"
                          value={dayData.start}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings((prev) => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day.key]: {
                                  ...dayData,
                                  start: val,
                                },
                              },
                            }));
                          }}
                          className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                      <span className="text-neutral-400">-</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-gray-400">Kapanış:</span>
                        <input
                          type="time"
                          value={dayData.end}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings((prev) => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day.key]: {
                                  ...dayData,
                                  end: val,
                                },
                              },
                            }));
                          }}
                          className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full w-fit">
                      🚫 Kapalı (Hizmet Verilmiyor)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* NOTIFICATION CHANNELS */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide">Bildirim Kanalları</h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Müşterilerinize iletilen randevu ve OTP bildirimlerinin gönderim kanallarını belirleyin.</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex justify-between items-center py-2.5 border-b border-neutral-200 dark:border-white/5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">E-posta Bildirimleri</h3>
                <p className="text-[11px] text-neutral-500 dark:text-gray-400">Tüm paketlerde aktif ve ücretsizdir.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={e => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                className="w-5 h-5 rounded border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-0 cursor-pointer accent-primary"
              />
            </div>

            {/* SMS */}
            <div className="flex justify-between items-center py-2.5 border-b border-neutral-200 dark:border-white/5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">SMS Bildirimleri</h3>
                <p className="text-[11px] text-neutral-500 dark:text-gray-400">PRO ve ELITE paketlerde Netgsm SMS entegrasyonu.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.smsEnabled}
                onChange={e => setSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                className="w-5 h-5 rounded border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-0 cursor-pointer accent-primary"
              />
            </div>

            {/* WhatsApp */}
            <div className="flex justify-between items-center py-2.5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">WhatsApp Bildirimleri</h3>
                <p className="text-[11px] text-neutral-500 dark:text-gray-400">Elite / API entegrasyonu ile limitsiz bildirimler.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappEnabled}
                onChange={e => setSettings(prev => ({ ...prev, whatsappEnabled: e.target.checked }))}
                className="w-5 h-5 rounded border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-0 cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        {/* SYSTEM & BILLING NOTIFICATION PREFERENCE */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide">Sistem & Ödeme Bildirim Kanalı Tercihi</h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Ödeme hatırlatmaları, randevu bildirimleri ve makbuzların tarafınıza hangi kanal üzerinden iletileceğini seçin.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "WHATSAPP", name: "💬 WhatsApp", desc: "En hızlı ve kesintisiz kanal (Resimli fatura & makbuz)" },
                { id: "SMS", name: "📱 SMS", desc: "Temel SMS mesajları" },
                { id: "EMAIL", name: "📧 E-Posta", desc: "Standart e-posta gönderimleri" }
              ].map(channel => (
                <div
                  key={channel.id}
                  onClick={() => setSettings(prev => ({ ...prev, preferredNotificationChannel: channel.id }))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.preferredNotificationChannel === channel.id
                      ? "border-primary bg-primary/10 shadow-sm dark:shadow-gold-glow text-neutral-900 dark:text-white font-bold"
                      : "border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] hover:bg-neutral-100 dark:hover:bg-white/[0.04] text-neutral-600 dark:text-gray-400"
                  }`}
                >
                  <h3 className="font-extrabold text-sm mb-1">{channel.name}</h3>
                  <p className="text-[10px] leading-relaxed text-neutral-500 dark:text-gray-500">{channel.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary text-xs leading-relaxed font-semibold mt-2">
              💡 <b>Tavsiye:</b> Ödeme hatırlatmaları, randevu bildirimleri ve müşteri teyitlerinin anında cebinize düşmesi ve resimli/detaylı makbuz alabilmeniz için <b>WhatsApp</b> kanalını seçmenizi öneririz. WhatsApp üzerinden iletilen bildirimler çok daha hızlı ve kesintisizdir.
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2 pb-8">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ayarlar Kaydediliyor...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Değişiklikleri Kaydet</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
