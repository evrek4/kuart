"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalPrismaSettings {
  smsConfig: {
    provider?: string;
    apiKey?: string;
    title?: string;
  };
  posConfig: {
    provider?: string;
    apiKey?: string;
    secretKey?: string;
  };
  isDirectoryEnabled?: boolean;
}

export default function SettingsPage() {
  const [loadingR2, setLoadingR2] = useState(true);
  const [loadingPrisma, setLoadingPrisma] = useState(true);
  const [savingR2, setSavingR2] = useState(false);
  const [savingPrisma, setSavingPrisma] = useState(false);
  const [savingDirectory, setSavingDirectory] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Kuaför Rehberi Modülü Durumu
  const [isDirectoryEnabled, setIsDirectoryEnabled] = useState(false);

  // Cloudflare R2 Settings (JSON based with CDN URL)
  const [r2AccountId, setR2AccountId] = useState("");
  const [r2AccessKey, setR2AccessKey] = useState("");
  const [r2SecretKey, setR2SecretKey] = useState("");
  const [r2BucketName, setR2BucketName] = useState("");
  const [r2PublicCdnUrl, setR2PublicCdnUrl] = useState("");

  // SMS Entegrasyonu (Prisma based)
  const [smsProvider, setSmsProvider] = useState("netgsm");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsTitle, setSmsTitle] = useState("");

  // POS Entegrasyonu (Prisma based)
  const [posProvider, setPosProvider] = useState("iyzico");
  const [posApiKey, setPosApiKey] = useState("");
  const [posSecretKey, setPosSecretKey] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  // Load Cloudflare R2 settings
  useEffect(() => {
    async function loadR2Settings() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/r2-settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setR2AccountId(json.data.accountId || "");
            setR2AccessKey(json.data.accessKey || "");
            setR2SecretKey(json.data.secretKey || "");
            setR2BucketName(json.data.bucketName || "");
            setR2PublicCdnUrl(json.data.publicCdnUrl || "");
          }
        }
      } catch (err) {
        console.error("Failed to load R2 settings:", err);
      } finally {
        setLoadingR2(false);
      }
    }
    loadR2Settings();
  }, [API_BASE]);

  // Load Prisma global SMS & POS settings
  useEffect(() => {
    async function loadPrismaSettings() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data: GlobalPrismaSettings = json.data;
            setSmsProvider(data.smsConfig.provider || "netgsm");
            setSmsApiKey(data.smsConfig.apiKey || "");
            setSmsTitle(data.smsConfig.title || "");
            setPosProvider(data.posConfig.provider || "iyzico");
            setPosApiKey(data.posConfig.apiKey || "");
            setPosSecretKey(data.posConfig.secretKey || "");
            setIsDirectoryEnabled(data.isDirectoryEnabled ?? false);
          }
        }
      } catch (err) {
        console.error("Failed to load Prisma global settings:", err);
      } finally {
        setLoadingPrisma(false);
      }
    }
    loadPrismaSettings();
  }, [API_BASE]);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleR2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingR2(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/r2-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: r2AccountId,
          accessKey: r2AccessKey,
          secretKey: r2SecretKey,
          bucketName: r2BucketName,
          publicCdnUrl: r2PublicCdnUrl
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setR2SecretKey(json.data.secretKey || "");
        triggerNotification("Global R2 depolama ve bulut bağlantı ayarları güncellendi.");
      } else {
        triggerNotification(json.error?.message || "Ayarlar kaydedilemedi.");
      }
    } catch (err) {
      console.error("Save R2 settings error:", err);
      triggerNotification("R2 ayarları kaydedilirken hata oluştu.");
    } finally {
      setSavingR2(false);
    }
  };

  const handlePrismaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrisma(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudflareR2Config: {}, // kept empty/deprecated since we use R2 config json endpoint
          smsConfig: {
            provider: smsProvider,
            apiKey: smsApiKey,
            title: smsTitle
          },
          posConfig: {
            provider: posProvider,
            apiKey: posApiKey,
            secretKey: posSecretKey
          }
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          triggerNotification("SMS ve Sanal POS API altyapı ayarları güncellendi.");
        }
      } else {
        triggerNotification("Ayarlar kaydedilemedi.");
      }
    } catch (err) {
      console.error("Save Prisma settings error:", err);
      triggerNotification("SMS & POS ayarları kaydedilirken hata oluştu.");
    } finally {
      setSavingPrisma(false);
    }
  };

  const isLoading = loadingR2 || loadingPrisma;

  // Directory Modülü Toggle Handler
  const handleDirectoryToggle = async (newValue: boolean) => {
    setSavingDirectory(true);
    setIsDirectoryEnabled(newValue);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDirectoryEnabled: newValue })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        triggerNotification(`Kuaför Rehberi Modülü ${newValue ? "etkinleştirildi" : "devre dışı bırakıldı"}.`);
      } else {
        setIsDirectoryEnabled(!newValue); // Geri al
        triggerNotification(json.error?.message || "Değişiklik kaydedilemedi.");
      }
    } catch {
      setIsDirectoryEnabled(!newValue);
      triggerNotification("Bağlantı hatası.");
    } finally {
      setSavingDirectory(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-xl border border-borderlight dark:border-dark-border bg-white/95 dark:bg-[#081326]/90 backdrop-blur-md text-[#0B1933] dark:text-[#F7F8FA] font-semibold text-sm shadow-xl flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#0B1933] dark:bg-white animate-ping" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pb-6 border-b border-borderlight dark:border-dark-border">
        <h1 className="text-2xl font-black text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-tight">SİSTEM ALTYAPISI</h1>
        <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-1">Platform genelinde kullanılan 3. parti entegrasyon anahtarlarını yapılandırın (Kuaförler bu ayarları göremez).</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-[#0B1933] dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl">
          {/* Cloudflare R2 Card */}
          <div className="p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] shadow-sm flex flex-col gap-6 transition-colors">
            <div>
              <h3 className="font-extrabold text-base text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-wide">☁️ Cloudflare R2 Medya Depolama & CDN</h3>
              <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-1">Salon sahiplerinin galeriye yüklediği fotoğrafların saklanacağı S3 uyumlu R2 ve CDN ayarları.</p>
            </div>

            <form onSubmit={handleR2Submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">Account ID</label>
                <input
                  type="text"
                  placeholder="örn: 8a4c..."
                  value={r2AccountId}
                  onChange={(e) => setR2AccountId(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">Access Key ID</label>
                  <input
                    type="text"
                    placeholder="örn: c219..."
                    value={r2AccessKey}
                    onChange={(e) => setR2AccessKey(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">Secret Access Key</label>
                  <input
                    type="text"
                    placeholder="Değiştirmek istemiyorsanız maskeli bırakın"
                    value={r2SecretKey}
                    onChange={(e) => setR2SecretKey(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">Bucket Name</label>
                <input
                  type="text"
                  placeholder="kuafor-art-gallery"
                  value={r2BucketName}
                  onChange={(e) => setR2BucketName(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">Public CDN / Gateway URL</label>
                <input
                  type="url"
                  placeholder="https://pub-8a4c.r2.dev veya http://localhost:3001/uploads"
                  value={r2PublicCdnUrl}
                  onChange={(e) => setR2PublicCdnUrl(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingR2}
                className="w-full py-3.5 rounded-lg bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {savingR2 ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Depolama & CDN Ayarlarını Güncelle"
                )}
              </button>
            </form>
          </div>

          {/* SMS API Integration */}
          <div className="p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] shadow-sm flex flex-col gap-6 transition-colors">
            <div>
              <h3 className="font-extrabold text-base text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-wide">💬 SMS & Sanal POS API Entegrasyonları</h3>
              <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-1">Platform genelinde gönderilen OTP, randevu hatırlatma ve ortak Sanal POS API ayarları.</p>
            </div>

            <form onSubmit={handlePrismaSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-borderlight dark:border-dark-border pb-6 mb-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">SMS Servis Sağlayıcı</label>
                  <select
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="netgsm" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Netgsm</option>
                    <option value="iletimerkezi" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">İleti Merkezi</option>
                    <option value="twilio" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Twilio</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">SMS API Key</label>
                  <input
                    type="text"
                    placeholder="api-key-code"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">SMS Başlığı</label>
                  <input
                    type="text"
                    placeholder="KuaforArt"
                    value={smsTitle}
                    onChange={(e) => setSmsTitle(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">Sanal POS Sağlayıcı</label>
                  <select
                    value={posProvider}
                    onChange={(e) => setPosProvider(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="iyzico" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">iyzico</option>
                    <option value="paytr" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">PayTR</option>
                    <option value="stripe" className="bg-white dark:bg-[#120822] text-neutral-900 dark:text-white">Stripe</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">POS API Key</label>
                  <input
                    type="text"
                    placeholder="pos-api-key"
                    value={posApiKey}
                    onChange={(e) => setPosApiKey(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-600 dark:text-gray-400">POS Secret Key</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    value={posSecretKey}
                    onChange={(e) => setPosSecretKey(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPrisma}
                className="w-full py-3.5 rounded-lg bg-[#0B1933] dark:bg-white text-white dark:text-[#0B1933] font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {savingPrisma ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "SMS & POS Altyapı Ayarlarını Kaydet"
                )}
              </button>
            </form>
          </div>

          {/* Kuaför Rehberi Modülü Kartı */}
          <div className="p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] shadow-sm flex flex-col gap-6 transition-colors">
            <div>
              <h3 className="font-extrabold text-base text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-wide">📍 Kuaför Rehberi Modülü</h3>
              <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-1">
                Bu modül açıldığında kuaförler il/ilçe bazlı listelenebilir ve "Öne Çıkarma" özelliğini kullanabilir.
                Kapalıyken rehber sayfası ve tüm promote özellikleri erişilemez duruma gelir.
              </p>
            </div>

            <div className="flex items-center justify-between p-5 rounded-xl border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-[#0B1933] dark:text-[#F7F8FA]">
                  {isDirectoryEnabled ? "✅ Modül Aktif" : "⏸ Modül Kapalı"}
                </span>
                <span className="text-[10px] text-lightText-secondary dark:text-darkText-secondary">
                  {isDirectoryEnabled
                    ? "Kuaför Rehberi sayfası kullanıcılara açık durumda."
                    : "Kuaför Rehberi sayfası gizli, kullanıcılar erişemiyor."}
                </span>
              </div>

              {/* Toggle Switch */}
              <button
                id="directory-toggle-btn"
                type="button"
                disabled={savingDirectory}
                onClick={() => handleDirectoryToggle(!isDirectoryEnabled)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-60 ${
                  isDirectoryEnabled
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : "bg-gray-300 dark:bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isDirectoryEnabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {savingDirectory && (
              <div className="flex items-center gap-2 text-xs text-lightText-secondary dark:text-darkText-secondary">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
