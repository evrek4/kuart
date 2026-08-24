"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";
import CustomerAutocomplete from "@/components/appointments/CustomerAutocomplete";
import CheckoutModal from "@/components/appointments/CheckoutModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
  id: string;
  name: string;
  price: number | null;
  duration: number;
}

interface StaffMember {
  id: string;
  name: string;
  title: string | null;
}

interface Appointment {
  id: string;
  time: string;        // "HH:MM" – UTC saatinden oluşturulur
  clientName: string;
  phone: string;
  service: string;
  staffId: string;
  staffName: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  price: number;
  duration: number;
  confirmationStatus?: "PENDING" | "CONFIRMED" | "CANCELLED_BY_CUSTOMER";
  isPaid?: boolean;
  paymentMethod?: string;
  paidAmount?: number;
  staffCommissionEarned?: number;
}

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00",
];

const STATUS_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  CONFIRMED:  { bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/40",  text: "text-emerald-900 dark:text-emerald-100", badge: "bg-emerald-100 dark:bg-emerald-500 text-emerald-800 dark:text-emerald-900" },
  PENDING:    { bg: "bg-amber-50 dark:bg-amber-950/60  border-amber-200 dark:border-amber-500/40",    text: "text-amber-900 dark:text-amber-100",   badge: "bg-amber-100 dark:bg-amber-400  text-amber-800 dark:text-amber-900"  },
  COMPLETED:  { bg: "bg-sky-50 dark:bg-sky-950/60    border-sky-200 dark:border-sky-500/40",      text: "text-sky-900 dark:text-sky-100",     badge: "bg-sky-100 dark:bg-sky-400    text-sky-800 dark:text-sky-900"    },
  NO_SHOW:    { bg: "bg-red-50 dark:bg-red-950/60    border-red-200 dark:border-red-500/40",      text: "text-red-900 dark:text-red-100",     badge: "bg-red-100 dark:bg-red-500    text-red-800 dark:text-white"      },
  CANCELLED:  { bg: "bg-zinc-100 dark:bg-zinc-800/60  border-zinc-200 dark:border-zinc-600/40",     text: "text-zinc-700 dark:text-zinc-300",    badge: "bg-zinc-200 dark:bg-zinc-500   text-zinc-800 dark:text-white"      },
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Onaylı",
  PENDING: "Bekliyor",
  COMPLETED: "Tamamlandı",
  NO_SHOW: "Gelmedi",
  CANCELLED: "İptal",
};

const CONFIRMATION_STYLES: Record<string, { badge: string; label: string }> = {
  CONFIRMED: { badge: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30", label: "✅ Teyit Edildi" },
  PENDING: { badge: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30", label: "⏳ Teyit Bekleniyor" },
  CANCELLED_BY_CUSTOMER: { badge: "bg-red-500/10 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-500/20 dark:border-red-500/30", label: "❌ Müşteri İptal Etti" }
};

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
/** dateTime ISO string'ini yerel "HH:MM" formatına çevirir (UTC kaymasından arındırır) */
function toLocalTime(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** Seçilen tarih + saat + yerel offset'i UTC ISO'ya dönüştürür */
function toUTCISOString(date: string, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const router = useRouter();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobil görünüm için seçili personel
  const [activeStaffId, setActiveStaffId] = useState<string>("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCheckoutApp, setSelectedCheckoutApp] = useState<Appointment | null>(null);

  // Form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isPhoneAutoFilled, setIsPhoneAutoFilled] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/calendar");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  // ── Token helper ────────────────────────────────────────────────────────────
  const getToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("kuafor-token="))?.split("=")[1];

  // ── Veri Çekme ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!tenantSlug) return;
    setLoading(true);
    try {
      const token = getToken();
      const headers = {
        "x-tenant-slug": tenantSlug,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Staff, Services ve Appointments paralel çekimi
      const [resStaff, resServices, resApps] = await Promise.all([
        fetch(`${API_BASE}/api/staff`, { headers }),
        fetch(`${API_BASE}/api/services`, { headers }),
        fetch(`${API_BASE}/api/appointments?date=${selectedDate}`, { headers }),
      ]);

      let fetchedStaff: StaffMember[] = [];
      let fetchedServices: Service[] = [];

      if (resStaff.ok) {
        const j = await resStaff.json();
        if (j.success && Array.isArray(j.data)) {
          fetchedStaff = j.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            title: s.title || null,
          }));
        }
      }

      if (resServices.ok) {
        const j = await resServices.json();
        if (j.success && Array.isArray(j.data)) {
          fetchedServices = j.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            price: s.price !== null && s.price !== undefined ? Number(s.price) : null,
            duration: s.duration || 30,
          }));
        }
      }

      // Eğer staff veya services rotaları boş döndüyse fallback olarak /profile dene
      if (fetchedStaff.length === 0 || fetchedServices.length === 0) {
        try {
          const resProfile = await fetch(`${API_BASE}/api/appointments/profile`, { headers });
          if (resProfile.ok) {
            const jProfile = await resProfile.json();
            if (jProfile.success && jProfile.data) {
              if (fetchedStaff.length === 0 && Array.isArray(jProfile.data.staff)) {
                fetchedStaff = jProfile.data.staff;
              }
              if (fetchedServices.length === 0 && Array.isArray(jProfile.data.services)) {
                fetchedServices = jProfile.data.services;
              }
            }
          }
        } catch {
          // Sessizce devam et
        }
      }

      setStaffList(fetchedStaff);
      setServices(fetchedServices);

      if (fetchedStaff.length > 0) {
        setActiveStaffId((prev) => (prev && fetchedStaff.some(s => s.id === prev) ? prev : fetchedStaff[0].id));
      }

      if (resApps.ok) {
        const j = await resApps.json();
        if (j.success && Array.isArray(j.data)) {
          // UTC → yerel saat dönüşümü
          const mapped: Appointment[] = j.data.map((a: any) => ({
            id: a.id,
            time: a.dateTime ? toLocalTime(a.dateTime) : a.time || "--:--",
            clientName: a.clientName || a.customer?.name || "Bilinmeyen",
            phone: a.phone || a.customer?.phone || "-",
            service: a.service || a.serviceName || "Genel",
            staffId: a.staffId || "",
            staffName: a.staffName || "Personel",
            status: a.status || "PENDING",
            price: a.price || 0,
            duration: a.duration || 30,
            confirmationStatus: a.confirmationStatus || "PENDING",
            isPaid: !!a.isPaid,
            paymentMethod: a.paymentMethod || "N/A",
            paidAmount: a.paidAmount || 0,
            staffCommissionEarned: a.staffCommissionEarned || 0,
          }));
          setAppointments(mapped);
        }
      }
    } catch (err) {
      console.error("fetchAll error:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, selectedDate, API_BASE, activeStaffId]);

  useEffect(() => {
    if (authReady && tenantSlug) fetchAll();
  }, [authReady, tenantSlug, selectedDate, fetchAll]);

  // ── Tıklayarak Randevu Aç ───────────────────────────────────────────────────
  const handleCellClick = (time: string, staffId: string) => {
    // Dolu veya kilitli slotlarda modal açma (Müşteri iptal ettiği randevu slotu boş sayılır)
    const isOccupied = appointments.some(
      (a) => a.staffId === staffId && a.time === time && a.status !== "CANCELLED" && a.confirmationStatus !== "CANCELLED_BY_CUSTOMER"
    );
    if (isOccupied) return;

    setSelectedTime(time);
    setSelectedStaffId(staffId);
    setClientName("");
    setClientPhone("");
    setIsPhoneAutoFilled(false);
    setSelectedServiceId("");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // ── Randevu Kaydet ───────────────────────────────────────────────────────────
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedServiceId || !selectedStaffId || !tenantSlug) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const token = getToken();
      const dateTimeUTC = toUTCISOString(selectedDate, selectedTime);
      const cleanPhone = clientPhone.replace(/\s+/g, "").trim();

      const payload = {
        serviceId: selectedServiceId,
        staffId: selectedStaffId,
        dateTime: dateTimeUTC,
        customerName: clientName.trim(),
        customerPhone: cleanPhone,
      };

      const response = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setSuccessMessage("✅ Randevu başarıyla oluşturuldu!");
        setTimeout(() => setSuccessMessage(null), 3000);
        setIsModalOpen(false);
        // Form alanlarını sıfırla
        setClientName("");
        setClientPhone("");
        setSelectedServiceId("");
        // Takvimi gerçek verilerle yenile
        await fetchAll();
      } else {
        const errorMsg = json.error?.message || json.message || "Randevu kaydedilemedi.";
        console.error("Create appointment API error:", json);
        setErrorMessage(errorMsg);
      }
    } catch (err: any) {
      console.error("Create appointment connection error:", err);
      setErrorMessage(err?.message || "Sunucuya ulaşılamadı.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Blocked Slots Hesaplama ─────────────────────────────────────────────────
  const buildSkipSlots = (): Record<string, Set<string>> => {
    const skip: Record<string, Set<string>> = {};
    for (const app of appointments) {
      if (app.status === "CANCELLED" || app.confirmationStatus === "CANCELLED_BY_CUSTOMER") continue;
      if (!skip[app.staffId]) skip[app.staffId] = new Set();
      const startIdx = TIME_SLOTS.indexOf(app.time);
      if (startIdx === -1) continue;
      const slots = Math.ceil(app.duration / 30);
      for (let i = 1; i < slots; i++) {
        const t = TIME_SLOTS[startIdx + i];
        if (t) skip[app.staffId].add(t);
      }
    }
    return skip;
  };

  const skipSlots = buildSkipSlots();

  // ── Render ──────────────────────────────────────────────────────────────────
  const AppointmentCard = ({ app }: { app: Appointment }) => {
    const isCancelled = app.status === "CANCELLED" || app.confirmationStatus === "CANCELLED_BY_CUSTOMER";
    const style = STATUS_STYLES[app.status] || STATUS_STYLES.PENDING;
    const confStyle = CONFIRMATION_STYLES[app.confirmationStatus || "PENDING"] || CONFIRMATION_STYLES.PENDING;

    return (
      <div
        className={`p-2.5 rounded-xl border flex flex-col gap-1 ${style.bg} ${
          isCancelled ? "opacity-35 border-red-500/40 line-through filter grayscale" : ""
        } transition-all duration-200 relative`}
      >
        <div className="flex justify-between items-start gap-1">
          <span className={`text-xs font-black truncate leading-tight ${style.text}`}>
            {app.clientName}
          </span>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <span className={`text-[8px] font-black px-1 py-0.5 rounded-full ${style.badge}`}>
              {STATUS_LABEL[app.status] || app.status}
            </span>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${confStyle.badge}`}>
              {confStyle.label}
            </span>
          </div>
        </div>
        <span className={`text-[10px] truncate ${style.text} opacity-80`}>
          ✂️ {app.service}
        </span>
        <span className={`text-[10px] truncate ${style.text} opacity-70`}>
          👤 {app.staffName}
        </span>
        
        <div className="flex justify-between items-center mt-1.5 border-t border-white/5 pt-1.5">
          <span className={`text-[10px] font-black ${style.text}`}>
            {app.price > 0 ? `${app.price} TL` : "Ücretsiz"}
          </span>
          {app.isPaid ? (
            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-emerald-950 uppercase select-none tracking-wider shrink-0">
              ÖDENDİ
            </span>
          ) : !isCancelled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCheckoutApp(app);
              }}
              className="px-2 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-black font-extrabold text-[8px] uppercase tracking-wider transition-all select-none shadow-gold-glow/20 shrink-0"
            >
              🧾 Ödeme Al
            </button>
          ) : null}
        </div>
        
        {isCancelled && (
          <div className="absolute inset-0 bg-red-955/10 border-2 border-red-500/10 rounded-xl flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest bg-[#121212] px-1.5 py-0.5 rounded border border-red-500/20 shadow-md">İPTAL</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">

      {/* Bildirim Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full border border-primary/30 bg-[#121212]/95 backdrop-blur-md text-primary font-semibold text-sm shadow-gold-glow flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Başlık + Tarih Navigasyonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-neutral-900 dark:text-white">📅 AJANDA TAKVİMİ</h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
            Personel bazlı randevu planlaması — boş saate tıkla, anında ekle
          </p>
        </div>

        {/* Tarih Navigasyon Barı */}
        <div className="flex items-center gap-2">
          {/* Önceki Gün */}
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-primary/40 text-neutral-900 dark:text-white transition-all text-lg font-bold shadow-sm"
            title="Önceki Gün"
          >
            ‹
          </button>

          {/* Tarih Label + Picker */}
          <div className="relative group">
            <div className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-neutral-900 dark:text-white font-semibold text-center min-w-[140px] cursor-pointer select-none group-hover:border-primary/40 transition-colors shadow-sm">
              {(() => {
                const d = new Date(selectedDate + "T12:00:00");
                const isToday = selectedDate === new Date().toISOString().split("T")[0];
                const isPast = new Date(selectedDate) < new Date(new Date().toISOString().split("T")[0]);
                return (
                  <span>
                    {isToday && <span className="text-primary mr-1">●</span>}
                    {isPast && !isToday && <span className="text-gray-400 mr-1">◷</span>}
                    {d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "short" })}
                  </span>
                );
              })()}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              title="Tarih seç"
            />
          </div>

          {/* Sonraki Gün */}
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 hover:border-primary/40 text-neutral-900 dark:text-white transition-all text-lg font-bold shadow-sm"
            title="Sonraki Gün"
          >
            ›
          </button>

          {/* Bugün Kısayolu */}
          {selectedDate !== new Date().toISOString().split("T")[0] && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
              className="px-3 py-2 rounded-xl border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 uppercase tracking-widest">Takvim Yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* ── MASAÜSTÜ GRID TAKVİM ──────────────────────────────────────── */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="w-16 text-[10px] text-neutral-500 dark:text-gray-500 font-bold uppercase tracking-wider pb-3 text-left pl-2">
                    Saat
                  </th>
                  {staffList.map((staff) => (
                    <th key={staff.id} className="text-center pb-3 px-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                          {staff.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">{staff.name}</span>
                        {staff.title && (
                          <span className="text-[9px] text-primary/80 dark:text-primary/70">{staff.title}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  {staffList.length === 0 && (
                    <th className="text-center pb-3 px-2 text-xs text-neutral-500 dark:text-gray-500">
                      Personel tanımlı değil — Personellerim sayfasından ekleyin
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => (
                  <tr key={time} className="border-t border-neutral-200 dark:border-white/[0.04] hover:bg-neutral-100/50 dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="pl-2 py-1 text-xs font-black text-neutral-700 dark:text-gray-400 w-16 align-top pt-2">
                      {time}
                    </td>
                    {staffList.map((staff) => {
                      const activeApp = appointments.find(
                        (a) => a.time === time && a.staffId === staff.id && a.status !== "CANCELLED" && a.confirmationStatus !== "CANCELLED_BY_CUSTOMER"
                      );
                      const cancelledApp = appointments.find(
                        (a) => a.time === time && a.staffId === staff.id && (a.status === "CANCELLED" || a.confirmationStatus === "CANCELLED_BY_CUSTOMER")
                      );
                      const app = activeApp || cancelledApp;
                      const isCancelled = !activeApp && !!cancelledApp;
                      const isBlocked = skipSlots[staff.id]?.has(time);

                      const slotsCount = app && !isCancelled ? Math.ceil(app.duration / 30) : 1;
                      const rowH = `${slotsCount * 44}px`;

                      if (isBlocked) {
                        return (
                          <td key={staff.id} className="px-1 py-0.5 align-top">
                            <div className="h-10 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-100 dark:bg-white/[0.02] flex items-center justify-center text-[9px] text-neutral-400 dark:text-gray-600">
                              🔒
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={staff.id}
                          className="px-1 py-0.5 align-top cursor-pointer"
                          style={app && !isCancelled ? { height: rowH } : {}}
                          onClick={() => (!app || isCancelled) && handleCellClick(time, staff.id)}
                        >
                          {app ? (
                            <div className="flex flex-col gap-1.5">
                              <AppointmentCard app={app} />
                              {isCancelled && (
                                <div className="h-8 rounded-xl border border-dashed border-primary/20 hover:border-primary/60 hover:bg-primary/5 flex items-center justify-center text-[9px] text-primary transition-all duration-200">
                                  + Boş Slot
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-10 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-[10px] text-neutral-400 dark:text-gray-600 hover:text-primary transition-all duration-200 opacity-0 group-hover:opacity-100">
                               +
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBİL AJANDA ─────────────────────────────────────────────── */}
          <div className="lg:hidden flex flex-col gap-3">
            {staffList.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {staffList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStaffId(s.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      activeStaffId === s.id
                        ? "bg-primary text-white border-primary shadow-sm dark:shadow-gold-glow"
                        : "bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-gray-300 border-neutral-200 dark:border-white/10"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-3xl p-3 flex flex-col gap-2 shadow-sm">
              {TIME_SLOTS.map((time) => {
                const activeApp = appointments.find(
                  (a) => a.time === time && a.staffId === activeStaffId && a.status !== "CANCELLED" && a.confirmationStatus !== "CANCELLED_BY_CUSTOMER"
                );
                const cancelledApp = appointments.find(
                  (a) => a.time === time && a.staffId === activeStaffId && (a.status === "CANCELLED" || a.confirmationStatus === "CANCELLED_BY_CUSTOMER")
                );
                const app = activeApp || cancelledApp;
                const isCancelled = !activeApp && !!cancelledApp;
                const isBlocked = skipSlots[activeStaffId]?.has(time);

                return (
                  <div key={time} className="flex gap-3 items-start py-2 border-b border-neutral-100 dark:border-white/5 last:border-none">
                    <span className="text-xs font-black text-neutral-700 dark:text-gray-400 w-12 shrink-0 pt-1">{time}</span>
                    <div className="flex-1">
                      {app ? (
                        <div className="flex flex-col gap-1.5">
                          <AppointmentCard app={app} />
                          {isCancelled && (
                            <button
                              onClick={() => handleCellClick(time, activeStaffId)}
                              className="w-full text-center py-2 px-3 rounded-xl border border-dashed border-primary/25 hover:border-primary/50 text-[10px] font-bold text-primary hover:bg-primary/5 transition-all"
                            >
                              + Yerine Randevu Ekle
                            </button>
                          )}
                        </div>
                      ) : isBlocked ? (
                        <div className="py-2 px-3 rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.01] text-xs text-neutral-400 dark:text-gray-600 italic">
                          🔒 İşlem Devam Ediyor
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCellClick(time, activeStaffId)}
                          className="w-full text-left py-2 px-3 rounded-xl border border-dashed border-neutral-200 dark:border-white/10 text-xs text-neutral-500 dark:text-gray-500 hover:border-primary/40 hover:text-primary transition-all"
                        >
                          + Boş Saat — Randevu Ekle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── RANDEVU EKLEME MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5"
            >
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  ⚡ Hızlı Randevu Kaydı
                </h3>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                  <span className="text-primary font-bold">{selectedDate}</span> tarihinde{" "}
                  <span className="text-primary font-bold">{selectedTime}</span> için yeni randevu
                </p>
              </div>

              <form onSubmit={handleCreateAppointment} className="flex flex-col gap-4">

                {/* Müşteri Adı – Autocomplete */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Müşteri Adı Soyadı *</label>
                  <CustomerAutocomplete
                    required
                    value={clientName}
                    onChangeName={(name) => {
                      setClientName(name);
                      // İsim manuel değiştirilirse oto-dolu bayrağı sıfırla
                      setIsPhoneAutoFilled(false);
                    }}
                    onSelectCustomer={({ name, phone }) => {
                      setClientName(name);
                      setClientPhone(phone);
                      setIsPhoneAutoFilled(true);
                    }}
                    tenantSlug={tenantSlug}
                    placeholder="Müşteri arayın veya yeni isim yazın..."
                  />
                </div>

                {/* Telefon */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Telefon Numarası *</label>
                    {isPhoneAutoFilled && (
                      <button
                        type="button"
                        onClick={() => setIsPhoneAutoFilled(false)}
                        className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline font-bold transition-colors"
                      >
                        Düzenle
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="örn: 0532 999 8877"
                      value={clientPhone}
                      readOnly={isPhoneAutoFilled}
                      onChange={(e) => {
                        if (!isPhoneAutoFilled) {
                          const cleaned = e.target.value.replace(/\D/g, "");
                          const limited = cleaned.slice(0, 11);
                          let formatted = limited;
                          if (limited.length > 4 && limited.length <= 7) {
                            formatted = `${limited.slice(0, 4)} ${limited.slice(4)}`;
                          } else if (limited.length > 7) {
                            formatted = `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
                          }
                          setClientPhone(formatted);
                        }
                      }}
                      className={`w-full bg-white dark:bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors pr-10 ${
                        isPhoneAutoFilled
                          ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 cursor-default"
                          : "border-neutral-300 dark:border-white/10 focus:ring-2 focus:ring-primary"
                      }`}
                    />
                    {isPhoneAutoFilled && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 text-sm" title="Otomatik dolduruldu">
                        ✓
                      </span>
                    )}
                  </div>
                  {isPhoneAutoFilled && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium -mt-0.5">
                      ✨ Kayıtlı müşteriden otomatik dolduruldu
                    </p>
                  )}
                </div>

                {/* Hizmet Seçimi */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Hizmet Seçimi *</label>
                  <select
                    required
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">Hizmet seçin...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">
                        {s.name} ({s.duration} dk{s.price ? ` — ${s.price} TL` : ""})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personel */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Personel *</label>
                  <select
                    required
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">Personel seçin...</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-[#121212] text-neutral-900 dark:text-white">
                        {s.name}{s.title ? ` — ${s.title}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold text-center mt-2">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {isSaving ? "Kaydediliyor..." : "Randevuyu Kaydet"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adisyon Kapatma Modalı */}
      {selectedCheckoutApp && tenantSlug && (
        <CheckoutModal
          isOpen={!!selectedCheckoutApp}
          onClose={() => setSelectedCheckoutApp(null)}
          onSuccess={fetchAll}
          appointmentId={selectedCheckoutApp.id}
          clientName={selectedCheckoutApp.clientName}
          serviceName={selectedCheckoutApp.service}
          price={selectedCheckoutApp.price}
          tenantSlug={tenantSlug}
        />
      )}
    </div>
  );
}
