"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";
import CustomerAutocomplete from "@/components/appointments/CustomerAutocomplete";

// Randevu arayüzü (API'den gelen veri yapısıyla uyumlu)
interface Appointment {
  id: string;
  scheduledAt?: string;
  time?: string;
  date?: string;
  customer?: { name: string; phone: string };
  clientName?: string;
  phone?: string;
  service?: { name: string; price: number } | null;
  serviceName?: string;
  price?: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  confirmationStatus?: "PENDING" | "CONFIRMED" | "CANCELLED_BY_CUSTOMER";
}

// Normalleştirilmiş randevu (UI'da tutarlı kullanım için)
interface NormalizedAppointment {
  id: string;
  time: string;
  date: string;
  clientName: string;
  phone: string;
  service: string;
  price: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  confirmationStatus?: "PENDING" | "CONFIRMED" | "CANCELLED_BY_CUSTOMER";
}

// GÜVENLİK: Hardcoded mockPhotos array kaldırıldı.
// Galeri görselleri artık tenant'a özgü API'den dinamik çekilmektedir.

/**
 * API randevu objesini normalize eder (farklı alan adı formatları desteklenir)
 */
function normalizeAppointment(app: Appointment): NormalizedAppointment {
  const scheduledDate = app.scheduledAt ? new Date(app.scheduledAt) : null;
  return {
    id: app.id,
    time: scheduledDate
      ? scheduledDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      : app.time || "--:--",
    date: scheduledDate
      ? scheduledDate.toISOString().split("T")[0]
      : app.date || new Date().toISOString().split("T")[0],
    clientName: app.customer?.name || app.clientName || "Bilinmeyen",
    phone: app.customer?.phone || app.phone || "-",
    service: app.service?.name || app.serviceName || "Genel Hizmet",
    price: app.service?.price || app.price || 0,
    status: app.status,
    confirmationStatus: app.confirmationStatus || "PENDING",
  };
}

export default function Dashboard() {
  const router = useRouter();

  // Tenant bilgisi (JWT'den)
  const [tenantName, setTenantName] = useState<string>("Salonum");
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantAuthReady, setTenantAuthReady] = useState(false);
  const [planName, setPlanName] = useState<string>("FREE");

  // Randevu state'leri
  const [appointments, setAppointments] = useState<NormalizedAppointment[]>([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"appointment" | "customer">("appointment");

  // Form state'leri
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newService, setNewService] = useState("Saç Kesim & Stil");
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [notification, setNotification] = useState<string | null>(null);

  // Loyalty candidates state
  const [loyaltyCandidates, setLoyaltyCandidates] = useState<any[]>([]);
  const [currentCandidate, setCurrentCandidate] = useState<any | null>(null);

  // Finansal Özet state
  const [financialSummary, setFinancialSummary] = useState<{
    posRevenue: number;
    depositRevenue: number;
    cashExpectation: number;
    totalExpectedRevenue: number;
  }>({
    posRevenue: 0,
    depositRevenue: 0,
    cashExpectation: 0,
    totalExpectedRevenue: 0,
  });

  // Gerçek galeri önizleme state'i (mock array kaldırıldı, API'den besleniyor)
  const [galleryPreview, setGalleryPreview] = useState<{ id: string; url: string; name: string }[]>([]);
  const [galleryCapacity, setGalleryCapacity] = useState<{ usedBytes: number; maxCapacity: number }>({
    usedBytes: 0,
    maxCapacity: 104857600,
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  // ─── Adım 1: JWT'den tenant bilgisini oku ───────────────────────────────────
  useEffect(() => {
    const info = getCurrentTenantInfo();

    if (!info || !info.tenantId) {
      // Token yoksa veya geçersizse — login'e yönlendir
      router.replace("/login?callbackUrl=/dashboard");
      return;
    }

    setTenantSlug(info.tenantSlug);

    // Salon adını API'den al
    async function fetchTenantName() {
      if (!info?.tenantSlug) {
        setTenantName("Salonum");
        setTenantAuthReady(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/storefront/${info.tenantSlug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.data?.tenant?.name) {
              setTenantName(json.data.tenant.name.toUpperCase());
            }
            if (json.data?.tenant?.plan) {
              setPlanName(json.data.tenant.plan.toUpperCase());
            }
          } else {
            setTenantName("Salonum");
          }
        }
      } catch {
        setTenantName("Salonum");
      } finally {
        setTenantAuthReady(true);
      }
    }

    fetchTenantName();
  }, [router, API_BASE]);

  // ─── Adım 2: Randevuları API'den çek (tenantSlug hazır olduktan sonra) ──────
  const fetchAppointments = useCallback(async () => {
    if (!tenantSlug) return;

    setIsAppointmentsLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kuafor-token="))
        ?.split("=")[1];

      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${API_BASE}/api/appointments?date=${today}`,
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
          setAppointments(json.data.map(normalizeAppointment));
        }
      } else if (response.status === 401 || response.status === 403) {
        // Yetkisiz — token geçersiz, çıkış yap
        document.cookie = "kuafor-token=; path=/; max-age=0; SameSite=Lax";
        router.replace("/login");
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setIsAppointmentsLoading(false);
    }
  }, [tenantSlug, API_BASE, router]);

  useEffect(() => {
    if (tenantAuthReady && tenantSlug) {
      fetchAppointments();
    }
  }, [tenantAuthReady, tenantSlug, fetchAppointments]);

  // ─── Adım 3: Sadakat adaylarını çek ────────────────────────────────────────
  useEffect(() => {
    if (!tenantSlug) return;

    async function fetchLoyaltyCandidates() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("kuafor-token="))
          ?.split("=")[1];

        const response = await fetch(
          `${API_BASE}/api/customers/loyalty-candidates`,
          {
            headers: {
              // Hardcoded "prestij" yerine JWT'den gelen gerçek tenantSlug kullanılıyor
              "x-tenant-slug": tenantSlug!,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        const json = await response.json();
        if (response.ok && json.success && json.data.length > 0) {
          setLoyaltyCandidates(json.data);
          setCurrentCandidate(json.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch loyalty candidates:", err);
      }
    }

    fetchLoyaltyCandidates();
  }, [tenantSlug, API_BASE]);

  // Finansal özet verisini çek
  useEffect(() => {
    if (!tenantSlug) return;

    async function fetchFinancialSummary() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("kuafor-token="))
          ?.split("=")[1];

        const response = await fetch(`${API_BASE}/api/finance/summary`, {
          headers: {
            "x-tenant-slug": tenantSlug!,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await response.json();
        if (response.ok && json.success && json.data) {
          setFinancialSummary({
            posRevenue: json.data.posRevenue || 0,
            depositRevenue: json.data.depositRevenue || 0,
            cashExpectation: json.data.cashExpectation || 0,
            totalExpectedRevenue: json.data.totalExpectedRevenue || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch financial summary:", err);
      }
    }

    fetchFinancialSummary();
  }, [tenantSlug, API_BASE]);

  // ─── Adım 4: Galeri önizleme verisi çek (gerçek tenant verisi) ──────────────
  useEffect(() => {
    if (!tenantSlug) return;

    async function fetchGalleryPreview() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("kuafor-token="))
          ?.split("=")[1];

        const response = await fetch(`${API_BASE}/api/gallery`, {
          headers: {
            // GÜVENLİK: JWT'den okunan tenantSlug kullanılıyor — hardcoded değil
            "x-tenant-slug": tenantSlug!,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await response.json();
        if (response.ok && json.success && json.data) {
          // Sadece ilk 3 görsel (özet widget için)
          const items = (json.data.gallery || []).slice(0, 3).map((item: any) => ({
            id: item.id,
            url: item.url,
            name: item.name || "Galeri Görseli",
          }));
          setGalleryPreview(items);
          if (json.data.capacity) {
            setGalleryCapacity({
              usedBytes: json.data.capacity.usedBytes || 0,
              maxCapacity: json.data.capacity.maxCapacity || 104857600,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery preview:", err);
      }
    }

    fetchGalleryPreview();
  }, [tenantSlug, API_BASE]);

  const handleRemoveDepositRequirement = async (candidateId: string, name: string) => {
    if (!tenantSlug) return;
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/customers/${candidateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Hardcoded "prestij" yerine gerçek tenantSlug
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ requiresDeposit: false }),
      });
      const json = await response.json();
      if (response.ok && json.success) {
        triggerNotification(`${name} için ön ödeme zorunluluğu kaldırıldı.`);
        const remaining = loyaltyCandidates.filter((c) => c.id !== candidateId);
        setLoyaltyCandidates(remaining);
        setCurrentCandidate(remaining.length > 0 ? remaining[0] : null);
      } else {
        triggerNotification(json.error?.message || "İşlem gerçekleştirilemedi.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Bağlantı hatası.");
    }
  };

  const handleSkipCandidate = (candidateId: string) => {
    const remaining = loyaltyCandidates.filter((c) => c.id !== candidateId);
    setLoyaltyCandidates(remaining);
    setCurrentCandidate(remaining.length > 0 ? remaining[0] : null);
  };

  const handleToggleNoShow = (id: string) => {
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextStatus = app.status === "NO_SHOW" ? "PENDING" : "NO_SHOW";
          if (nextStatus === "NO_SHOW") {
            triggerNotification(`${app.clientName} kara listeye (No-Show) eklendi!`);
          }
          return { ...app, status: nextStatus };
        }
        return app;
      })
    );
  };

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone || !newTime) return;

    const isConflict = appointments.some(
      (app) => app.time === newTime && app.date === newDate
    );

    if (isConflict) {
      triggerNotification("⚠️ Bu saatte seçili personel doludur!");
      return;
    }

    const newApp: NormalizedAppointment = {
      id: Math.random().toString(),
      time: newTime,
      date: newDate,
      clientName: newClientName,
      phone: newClientPhone,
      service: newService,
      price: newService.includes("Balyaj") ? 650 : 150,
      status: "PENDING",
    };

    setAppointments((prev) =>
      [...prev, newApp].sort((a, b) => a.time.localeCompare(b.time))
    );
    triggerNotification(`Randevu Oluşturuldu: ${newClientName} (${newTime})`);
    setNewClientName("");
    setNewClientPhone("");
    setNewTime("");
    setNewDate(new Date().toISOString().split("T")[0]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  const totalRevenue = appointments
    .filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
    .reduce((sum, a) => sum + a.price, 0);

  const noShowCount = appointments.filter((a) => a.status === "NO_SHOW").length;

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 dark:text-[#F5F5F5] font-sans px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col gap-8 relative">
      {/* Glow effect backgrounds */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Floating notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full border border-primary/30 bg-[#121212]/90 backdrop-blur-md text-primary font-semibold text-sm shadow-gold-glow flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Widget — Salon adı ve subdomain JWT'den dinamik okunuyor */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-neutral-200 dark:border-white/5"
      >
        <div>
          <div className="flex items-center gap-3">
            {/* Dinamik salon adı — hardcoded "SALON PRESTİJ" değil */}
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{tenantName}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border uppercase shadow-sm dark:shadow-gold-glow ${
              planName === 'ELITE'
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                : planName === 'PRO'
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-neutral-500/10 border-neutral-500/20 text-neutral-600 dark:text-neutral-400'
            }`}>
              {planName} ÜYE
            </span>
          </div>
          <p className="text-neutral-500 dark:text-gray-400 text-sm mt-1">Güzellik Salonu Yönetim Paneli</p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm w-full md:w-auto">
          {tenantSlug && (
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              {/* Dinamik subdomain — hardcoded "prestij.kuafor.art" değil */}
              <span className="text-neutral-700 dark:text-gray-300 font-medium">Subdomain Aktif: {tenantSlug}.kuafor.art</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/customers">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full border border-neutral-200 dark:border-white/10 hover:border-primary/50 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:text-primary transition-all duration-300 bg-neutral-100 dark:bg-white/5"
              >
                👥 Müşteriler (CRM)
              </motion.button>
            </Link>
            <Link href="/dashboard/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full border border-neutral-200 dark:border-white/10 hover:border-primary/50 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:text-primary transition-all duration-300 bg-neutral-100 dark:bg-white/5"
              >
                ⚙️ Ayarlar
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Akıllı Sadakat Widget'ı */}
      <AnimatePresence>
        {currentCandidate && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="w-full p-6 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm dark:shadow-gold-glow relative overflow-hidden"
          >
            <div className="flex items-center gap-4 z-10">
              <span className="text-3xl">🌟</span>
              <div>
                <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider">Akıllı Sadakat Motoru</h3>
                <p className="text-neutral-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">
                  <span className="font-black text-neutral-900 dark:text-white">{currentCandidate.name}</span> adlı müşteriniz{" "}
                  <b>{currentCandidate.completedAppointmentsCount}</b> kez randevusuna zamanında geldi. Bu müşteri için ön ödeme zorunluluğunu kaldırmak ister misiniz?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 z-10 w-full md:w-auto shrink-0 mt-2 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRemoveDepositRequirement(currentCandidate.id, currentCandidate.name)}
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs tracking-wider uppercase hover:brightness-110 shadow-sm"
              >
                Kaldır
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSkipCandidate(currentCandidate.id)}
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-gray-300 font-extrabold text-xs tracking-wider uppercase hover:bg-neutral-200 dark:hover:bg-white/10"
              >
                İşleme Devam Et
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Widget 1: Bugünün Randevuları */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 md:col-span-2 flex flex-col gap-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold tracking-wide text-neutral-900 dark:text-white">BUGÜNKÜ RANDEVULAR</h2>
              <p className="text-xs text-neutral-500 dark:text-gray-400">Gelişmiş veri izolasyonu ile korunuyor</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-gray-300">
              {isAppointmentsLoading ? "..." : `${appointments.length} Aktif Randevu`}
            </span>
          </div>

          <div className="overflow-x-auto min-w-0 w-full">
            {isAppointmentsLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 dark:text-gray-400 text-sm">
                Bugün için randevu bulunamadı.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Saat</th>
                    <th className="pb-3 font-semibold">Müşteri</th>
                    <th className="pb-3 font-semibold">Hizmet</th>
                    <th className="pb-3 font-semibold text-right">Fiyat</th>
                    <th className="pb-3 font-semibold text-center">Durum</th>
                    <th className="pb-3 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                  {appointments.map((app) => (
                    <motion.tr
                      layoutId={`row-${app.id}`}
                      key={app.id}
                      className="hover:bg-neutral-100/60 dark:hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      <td className="py-3.5 font-bold text-primary">{app.time}</td>
                      <td className="py-3.5">
                        <div className="font-semibold text-neutral-900 dark:text-white">{app.clientName}</div>
                        <div className="text-xs text-neutral-500 dark:text-gray-400">{app.phone}</div>
                      </td>
                      <td className="py-3.5 text-neutral-700 dark:text-gray-300 font-medium">{app.service}</td>
                      <td className="py-3.5 text-right font-bold text-neutral-900 dark:text-white">{app.price} TL</td>
                      <td className="py-3.5 text-center">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider ${
                              app.status === "CONFIRMED"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                                : app.status === "NO_SHOW"
                                ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                                : app.status === "CANCELLED"
                                ? "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border border-zinc-500/20 line-through"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {app.status === "CONFIRMED"
                              ? "ONAYLI"
                              : app.status === "NO_SHOW"
                              ? "GELMEDİ"
                              : app.status === "CANCELLED"
                              ? "İPTAL"
                              : "BEKLEMEDE"}
                          </span>

                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                              app.confirmationStatus === "CONFIRMED"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : app.confirmationStatus === "CANCELLED_BY_CUSTOMER"
                                ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {app.confirmationStatus === "CONFIRMED"
                              ? "✅ Teyit Edildi"
                              : app.confirmationStatus === "CANCELLED_BY_CUSTOMER"
                              ? "❌ Müşteri İptal Etti"
                              : "⏳ Teyit Bekleniyor"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleNoShow(app.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors duration-200 ${
                            app.status === "NO_SHOW"
                              ? "bg-neutral-100 dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-gray-400 hover:bg-neutral-200 dark:hover:bg-white/10"
                              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white"
                          }`}
                        >
                          {app.status === "NO_SHOW" ? "Engeli Kaldır" : "Gelmedi İşaretle"}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Widget 2: Aylık Kazanç ve Kapora Özeti */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-extrabold tracking-wide text-neutral-900 dark:text-white">KAZANÇ & BAKİYE</h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400">Kapora koruması ve finansal özetler</p>
          </div>

          <div className="flex flex-col gap-6 my-6">
            <div>
              <span className="text-xs text-neutral-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Toplam Aylık Ciro</span>
              <div className="text-3xl font-black text-neutral-900 dark:text-white mt-1">
                {financialSummary.totalExpectedRevenue > 0
                  ? `${financialSummary.totalExpectedRevenue.toLocaleString("tr-TR")} TL`
                  : `${totalRevenue.toLocaleString("tr-TR")} TL`}
              </div>
            </div>

            <div>
              <span className="text-xs text-neutral-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Ortak Sanal POS Aktif</span>
              <div className="flex items-center gap-2 mt-1 text-primary">
                <span className="text-xl font-bold">
                  {financialSummary.posRevenue > 0
                    ? `${financialSummary.posRevenue.toLocaleString("tr-TR")} TL`
                    : `${totalRevenue.toLocaleString("tr-TR")} TL`}
                </span>
                <span className="text-xs text-neutral-500 dark:text-gray-400">(Kazanılan Kapora)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-primary">No-Show Engelleme</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-primary/20 text-primary">Dinamik</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-gray-400 leading-relaxed">
                Bu ay {noShowCount} güvenilmez müşteri kaporaya yönlendirildi ve cironuz güvenceye alındı.
              </p>
            </div>
          </div>

          <div className="text-xs text-neutral-500 dark:text-gray-400 pt-4 border-t border-neutral-200 dark:border-white/5 flex justify-between">
            <span>Ödeme Altyapısı: iyzico</span>
            <Link href="/dashboard/settings" className="text-primary font-bold hover:underline">
              POS Ayarları →
            </Link>
          </div>
        </motion.div>

        {/* Widget 3: Hızlı İşlem Formu */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold tracking-wide text-neutral-900 dark:text-white">HIZLI İŞLEM PANELİ</h2>
            <p className="text-xs text-neutral-500 dark:text-gray-400">Yeni randevu veya müşterileri kuyruğa ekleyin</p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-white/5 rounded-lg border border-neutral-200 dark:border-white/5 text-sm">
            <button
              onClick={() => setActiveTab("appointment")}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                activeTab === "appointment" ? "bg-primary text-white shadow-sm" : "text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Randevu Ekle
            </button>
            <button
              onClick={() => setActiveTab("customer")}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                activeTab === "customer" ? "bg-primary text-white shadow-sm" : "text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Müşteri Kaydet
            </button>
          </div>

          {activeTab === "appointment" ? (
            <form onSubmit={handleCreateAppointment} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Müşteri Adı Soyadı</label>
                <CustomerAutocomplete
                  required
                  value={newClientName}
                  onChangeName={setNewClientName}
                  onSelectCustomer={({ name, phone }) => {
                    setNewClientName(name);
                    setNewClientPhone(phone);
                  }}
                  tenantSlug={tenantSlug}
                  placeholder="örn: Canan Şen (yazarak arayın)"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  placeholder="örn: 0532 999 8877"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Randevu Tarihi</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">İşlem</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-2 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary select-custom"
                  >
                    <option value="Saç Kesim & Stil" className="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Saç Kesim</option>
                    <option value="Balyaj & Renklendirme" className="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Balyaj</option>
                    <option value="Sakal Tıraşı & Bakım" className="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Sakal Tıraşı</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Randevu Saati</label>
                  <input
                    type="text"
                    required
                    placeholder="örn: 17:30"
                    value={newTime}
                    onChange={(e) => {
                      let clean = e.target.value.replace(/\D/g, "");
                      if (clean.length > 4) clean = clean.slice(0, 4);
                      if (clean.length > 2) {
                        clean = clean.slice(0, 2) + ":" + clean.slice(2);
                      }
                      setNewTime(clean);
                    }}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all duration-200 mt-2 shadow-sm dark:shadow-gold-glow"
              >
                Randevu Kaydet
              </motion.button>
            </form>
          ) : (
            <div className="flex flex-col gap-4 py-6 text-center">
              <p className="text-sm text-neutral-500 dark:text-gray-400">Yeni müşteri ekleme arayüzü eklenti ile aktif edilir.</p>
              <button className="text-primary text-xs font-bold hover:underline">Hemen İletişime Geçin</button>
            </div>
          )}
        </motion.div>

        {/* Widget 4: Sistem Durumu & Medya Galerisi */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 md:col-span-2 flex flex-col justify-between gap-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-wide text-neutral-900 dark:text-white">SİSTEM DURUMU & GALERİ KAPASİTESİ</h2>
              <p className="text-xs text-neutral-500 dark:text-gray-400">Dosya boyutu ve R2 depolama izolasyon takibi</p>
            </div>
            <div className="flex flex-col items-end">
              {/* GÜVENLİK: Gerçek tenant kapasitesi API'den geliyor — hardcoded değil */}
              <span className="text-xs text-neutral-600 dark:text-gray-400 font-semibold">
                {(galleryCapacity.usedBytes / 1048576).toFixed(1)} MB / {(galleryCapacity.maxCapacity / 1048576).toFixed(0)} MB kullanıldı
              </span>
              <div className="w-48 h-2 bg-neutral-200 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden border border-neutral-200 dark:border-white/5">
                <div
                  className="h-full bg-primary rounded-full shadow-sm dark:shadow-gold-glow"
                  style={{
                    width: `${Math.min(100, (galleryCapacity.usedBytes / galleryCapacity.maxCapacity) * 100).toFixed(1)}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-neutral-600 dark:text-gray-400 font-bold block mb-3 uppercase tracking-wider">Son Yüklenen Görseller (Salonunuza Ait)</span>
            {galleryPreview.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {/* GÜVENLİK: galleryPreview artık bu tenant'a ait gerçek görsellerden oluşuyor */}
                {galleryPreview.map((photo) => (
                  <div key={photo.id} className="flex flex-col gap-2 group cursor-pointer">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-primary/20 bg-neutral-100 dark:bg-white/5 transition-all duration-300 group-hover:border-primary group-hover:shadow-md">
                      <Image
                        src={photo.url}
                        alt={photo.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-xs text-neutral-600 dark:text-gray-400 font-medium group-hover:text-primary transition-colors text-center">
                      {photo.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed border-neutral-300 dark:border-white/10 rounded-xl gap-3">
                <span className="text-4xl opacity-30">🖼️</span>
                <p className="text-xs text-neutral-500 dark:text-gray-400 text-center">Henüz görsel yüklenmemiş.<br />Galerinizi oluşturmak için görsel ekleyin.</p>
                <Link href="/dashboard/gallery" className="text-xs text-primary font-bold hover:underline">
                  Galeriyi Aç →
                </Link>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-gray-400 pt-4 border-t border-neutral-200 dark:border-white/5">
            <span>Depolama Sunucusu: Cloudflare R2</span>
            <Link href="/dashboard/gallery" className="text-primary font-bold hover:underline">
              Galeriye Git →
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
