"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  noShowCount: number;
  isBlacklisted: boolean;
  requiresDeposit: boolean;
  completedAppointmentsCount: number;
  completedCount?: number;
  isLoyaltyCandidate: boolean;
  loyaltyStamps?: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Tenant bilgisi JWT'den okunur — hardcoded değer yok
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string>("Salonum");
  const [authReady, setAuthReady] = useState(false);

  // Add Customer Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dismissedCandidates, setDismissedCandidates] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // ─── JWT'den tenant bilgisini oku ─────────────────────────────────────────
  useEffect(() => {
    const info = getCurrentTenantInfo();

    if (!info || !info.tenantId) {
      // Token yoksa veya geçersizse — 401 yerine login'e yönlendir
      router.replace("/login?callbackUrl=/dashboard/customers");
      return;
    }

    setTenantSlug(info.tenantSlug);

    // Salon adını API'den al
    async function fetchTenantName() {
      if (!info?.tenantSlug) {
        setTenantName("Salonum");
        setAuthReady(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/storefront/${info.tenantSlug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.tenant?.name) {
            setTenantName(json.data.tenant.name.toUpperCase());
          }
        }
      } catch {
        // Sessizce devam et
      } finally {
        setAuthReady(true);
      }
    }

    fetchTenantName();
  }, [router, API_BASE]);

  // ─── Müşterileri API'den çek (auth hazır olduktan sonra) ───────────────────
  const loadCustomers = async () => {
    if (!tenantSlug) return;
    try {
      setIsLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/customers`, {
        headers: {
          // tenantSlug artık JWT'den geliyor — hardcoded değil
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setCustomers(json.data || []);
      } else if (response.status === 401 || response.status === 403) {
        document.cookie = "kuafor-token=; path=/; max-age=0; SameSite=Lax";
        router.replace("/login");
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authReady && tenantSlug) {
      loadCustomers();
    }
  }, [authReady, tenantSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleDeposit = async (customer: Customer) => {
    if (!tenantSlug) return;
    const nextValue = !customer.requiresDeposit;

    // Optimistic UI update
    setCustomers(prev =>
      prev.map(c => (c.id === customer.id ? { ...c, requiresDeposit: nextValue } : c))
    );

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/customers/${customer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // JWT'den gelen tenantSlug — hardcoded değil
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          requiresDeposit: nextValue
        })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        triggerNotification(
          `${customer.name} için ön ödeme zorunluluğu ${nextValue ? "aktif edildi" : "kaldırıldı"}.`
        );
      } else {
        // Rollback on error
        setCustomers(prev =>
          prev.map(c => (c.id === customer.id ? { ...c, requiresDeposit: customer.requiresDeposit } : c))
        );
        triggerNotification(json.error?.message || "Ayarlar güncellenirken hata oluştu.");
      }
    } catch (err) {
      // Rollback on error
      setCustomers(prev =>
        prev.map(c => (c.id === customer.id ? { ...c, requiresDeposit: customer.requiresDeposit } : c))
      );
      triggerNotification("Bağlantı hatası: Müşteri bilgisi güncellenemedi.");
    }
  };

  const handleKeepDeposit = (id: string) => {
    setDismissedCandidates(prev => [...prev, id]);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !tenantSlug) return;

    setSubmitting(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kuafor-token="))
        ?.split("=")[1];

      // Telefon numarasından boşlukları temizle (API ile standart format)
      const cleanPhone = phone.replace(/\s+/g, '').trim();

      const response = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, email: email || undefined, phone: cleanPhone }),
      });

      const json = await response.json();
      if (response.ok && json.success && json.data) {
        const newCustomer: Customer = {
          id: json.data.id,
          name: json.data.name,
          email: json.data.email || null,
          phone: json.data.phone,
          noShowCount: json.data.noShowCount || 0,
          isBlacklisted: json.data.isBlacklisted || false,
          requiresDeposit: json.data.requiresDeposit !== undefined ? json.data.requiresDeposit : true,
          completedAppointmentsCount: 0,
          completedCount: 0,
          isLoyaltyCandidate: false,
        };

        // Anında UI güncelle (Mutasyon)
        setCustomers(prev => [newCustomer, ...prev.filter(c => c.id !== newCustomer.id)]);
        triggerNotification("Müşteri başarıyla eklendi!");
        setIsModalOpen(false);

        // Formu temizle
        setName("");
        setEmail("");
        setPhone("");

        // Arka planda tam listeyi tekrar senkronize et
        loadCustomers();
      } else {
        // Hata durumunda modal KAPATILMAZ, uyarı gösterilir
        triggerNotification(json.error?.message || "Müşteri kaydedilirken hata oluştu.");
      }
    } catch (err) {
      console.error("Create customer error:", err);
      triggerNotification("Müşteri eklenirken sunucu hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 dark:text-[#F5F5F5] font-sans px-4 py-8 md:px-8 max-w-6xl mx-auto flex flex-col gap-8 relative transition-colors duration-200">
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
            className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full border border-primary/30 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md text-primary font-semibold text-sm shadow-lg dark:shadow-gold-glow flex items-center gap-2"
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
        className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-200 dark:border-white/5"
      >
        <div>
          <div className="flex items-center gap-3">
            {/* Dinamik salon adı — JWT'den okunuyor */}
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{tenantName}</h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-primary/10 border border-primary/20 text-primary uppercase shadow-sm dark:shadow-gold-glow">
              CRM MÜŞTERİLERİ
            </span>
          </div>
          <p className="text-neutral-500 dark:text-gray-400 text-sm mt-1">İzole Müşteri Listesi ve Manuel Kapora Yönetimi</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-colors"
          >
            + Yeni Müşteri Ekle
          </button>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-full border border-neutral-200 dark:border-white/10 hover:border-primary/50 text-xs font-bold text-neutral-700 dark:text-gray-300 hover:text-primary transition-all duration-300 bg-neutral-100 dark:bg-white/5"
            >
              ← Geri
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* Loyalty candidates notification widgets */}
      {customers.filter(c => c.isLoyaltyCandidate && !dismissedCandidates.includes(c.id)).map(cand => (
        <div key={cand.id} className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
          <div className="flex gap-2.5 items-center">
            <span className="text-xl">🌟</span>
            <div className="text-xs text-neutral-700 dark:text-gray-300">
              <strong className="text-neutral-900 dark:text-white text-sm">{cand.name}</strong> adlı müşteriniz <strong>{cand.completedAppointmentsCount || cand.completedCount} kez</strong> randevusuna zamanında geldi. Bu müşteri için kapora zorunluluğunu kaldırmak ister misiniz?
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => handleToggleDeposit(cand)}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-extrabold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
            >
              Kaldır (Muaf Yap)
            </button>
            <button
              type="button"
              onClick={() => handleKeepDeposit(cand.id)}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl border border-neutral-300 dark:border-white/10 text-neutral-600 dark:text-gray-400 font-extrabold text-[10px] uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            >
              Kapora Almaya Devam Et
            </button>
          </div>
        </div>
      ))}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {customers.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <p className="text-neutral-500 dark:text-gray-400">Henüz kayıtlı bir müşteri bulunmuyor.</p>
            </div>
          ) : (
            <>
              {/* MASAÜSTÜ TABLO GÖRÜNÜMÜ */}
              <div className="hidden md:block overflow-x-auto rounded-3xl border border-neutral-200 dark:border-white/5 bg-white/80 dark:bg-[#121212]/60 backdrop-blur-md shadow-sm">
                <table className="w-full text-left border-collapse table-auto text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-gray-400 text-xs uppercase tracking-wider bg-neutral-50 dark:bg-white/[0.01]">
                      <th className="py-4 px-6 font-bold">Müşteri Adı</th>
                      <th className="py-4 px-6 font-bold">Telefon</th>
                      <th className="py-4 px-6 font-bold">E-Posta</th>
                      <th className="py-4 px-6 font-bold text-center">Tamamlanan</th>
                      <th className="py-4 px-6 font-bold text-center">Sadakat (Damga)</th>
                      <th className="py-4 px-6 font-bold text-center">Gelmedi (No-Show)</th>
                      <th className="py-4 px-6 font-bold">Sadakat Adayı</th>
                      <th className="py-4 px-6 text-center font-bold">Ön Ödeme (Kapora)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-neutral-100/50 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6 font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
                            {(customer?.name || "M").charAt(0).toUpperCase()}
                          </div>
                          <span>{customer?.name || "İsimsiz Müşteri"}</span>
                        </td>
                        <td className="py-4 px-6 font-mono text-neutral-700 dark:text-gray-300">{customer?.phone || "-"}</td>
                        <td className="py-4 px-6 text-neutral-600 dark:text-gray-400">{customer?.email || "-"}</td>
                        <td className="py-4 px-6 text-center font-black text-neutral-900 dark:text-white">{customer?.completedAppointmentsCount ?? customer?.completedCount ?? 0}</td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                            🏷️ {customer?.loyaltyStamps ?? 0} Damga
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-black text-red-600 dark:text-red-400">{customer?.noShowCount ?? 0}</td>
                        <td className="py-4 px-6">
                          {customer?.isLoyaltyCandidate ? (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-primary/20 text-primary border border-primary/30 shadow-sm animate-pulse">
                              🌟 Aday
                            </span>
                          ) : (
                            <span className="text-neutral-400 dark:text-gray-600 text-xs font-semibold">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDeposit(customer)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                              customer?.requiresDeposit ? "bg-primary" : "bg-neutral-200 dark:bg-white/10"
                            }`}
                          >
                            <motion.div
                              layout
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className={`bg-white dark:bg-[#0B0B0B] w-[18px] h-[18px] rounded-full shadow-md ${
                                customer?.requiresDeposit ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBİL KART GÖRÜNÜMÜ */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {customers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden"
                  >
                    {customer?.isLoyaltyCandidate && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 shadow-sm">
                        🌟 Sadık Adayı
                      </span>
                    )}

                    <div className="flex flex-col gap-1">
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">{customer?.name || "İsimsiz Müşteri"}</h3>
                      <div className="text-xs text-neutral-500 dark:text-gray-400 font-medium">📞 {customer?.phone || "-"}</div>
                      {customer?.email && <div className="text-xs text-neutral-500 dark:text-gray-400 font-medium">📧 {customer.email}</div>}
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-neutral-200 dark:border-white/5 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 dark:text-gray-400 uppercase tracking-wider block">Tamamlanan</span>
                        <span className="text-sm font-black text-neutral-900 dark:text-white">{(customer?.completedAppointmentsCount ?? customer?.completedCount ?? 0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 dark:text-gray-400 uppercase tracking-wider block">Sadakat</span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">🏷️ {customer?.loyaltyStamps ?? 0} Damga</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 dark:text-gray-400 uppercase tracking-wider block">No-Show</span>
                        <span className="text-sm font-black text-red-600 dark:text-red-400">{customer?.noShowCount ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white block">Ön Ödeme Zorunluluğu</span>
                        <span className="text-[10px] text-neutral-500 dark:text-gray-400 font-medium">Randevularda kapora tahsil edilir.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleDeposit(customer)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                          customer.requiresDeposit ? "bg-primary" : "bg-neutral-200 dark:bg-white/10"
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`bg-white dark:bg-[#0B0B0B] w-[18px] h-[18px] rounded-full shadow-md ${
                            customer.requiresDeposit ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
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
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Yeni Müşteri Kaydet</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    placeholder="örn: Canan Şen"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">Telefon Numarası *</label>
                  <input
                    type="tel"
                    required
                    placeholder="örn: 0532 999 8877"
                    value={phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      const limited = cleaned.slice(0, 11);
                      let formatted = limited;
                      if (limited.length > 4 && limited.length <= 7) {
                        formatted = `${limited.slice(0, 4)} ${limited.slice(4)}`;
                      } else if (limited.length > 7) {
                        formatted = `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
                      }
                      setPhone(formatted);
                    }}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">E-Posta Adresi</label>
                  <input
                    type="email"
                    placeholder="örn: canan@mail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

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
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
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
