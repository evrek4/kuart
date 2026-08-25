"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";

interface SubscriptionInfo {
  planName: string;
  planId: string;
  billingStatus: string;
  nextBillingDate: string | null;
  autoRenewal: boolean;
  cardLastFour: string | null;
}

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  storageLimitMB: number;
  features: string | string[];
  isFree: boolean;
  isActive: boolean;
  allowPortalThemes: boolean;
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | string;
  transactionId: string;
  planName: string;
  paidAt: string;
  nextBillingDate: string;
  cardLastFour: string | null;
  appliedCouponCode?: string | null;
  originalAmount?: number | null;
}

function BillingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [checkoutLoadingPlanId, setCheckoutLoadingPlanId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Kupon states
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState<PlanInfo | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [validatedCoupon, setValidatedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountedPrice: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  // Check URL query parameters for success notifications
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      triggerNotification("Ödemeniz başarıyla tamamlandı! Paketiniz güncellendi.");
      router.replace("/dashboard/billing");
    }
  }, [searchParams, router]);

  // Read tenant info from JWT
  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/billing");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  // Fetch subscription, plans, and history
  const loadData = async () => {
    if (!authReady) return;
    try {
      setLoading(true);
      setError(null);

      const subRes = await fetch(`${API_BASE}/api/payments/subscription`);
      const subData = await subRes.json();

      const plansRes = await fetch(`${API_BASE}/api/payments/plans`);
      const plansData = await plansRes.json();

      const historyRes = await fetch(`${API_BASE}/api/payments/history`);
      const historyData = await historyRes.json();

      if (subData.success) setSubscription(subData.data);
      if (plansData.success) setPlans(plansData.data ?? []);
      if (historyData.success) setHistory(historyData.data ?? []);
    } catch (err: any) {
      console.error("Failed to load billing data:", err);
      setError("Veriler yüklenirken bir bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [authReady]);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCheckout = async (planId: string, couponCode?: string) => {
    try {
      setCheckoutLoadingPlanId(planId);
      setError(null);

      const res = await fetch(`${API_BASE}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, couponCode }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Ödeme oturumu başlatılamadı.");
      }

      const checkoutData = json.data;
      if (checkoutData.paymentPageUrl) {
        if (checkoutData.isFree) {
          // Ücretsiz plan — doğrudan yönlendir
          router.replace(checkoutData.paymentPageUrl);
        } else {
          setPaymentUrl(checkoutData.paymentPageUrl);
          setShowModal(true);
        }
      } else {
        throw new Error("Ödeme adresi alınamadı.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Ödeme işlemi başlatılırken hata oluştu.");
    } finally {
      setCheckoutLoadingPlanId(null);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCodeInput.trim() || !selectedPlanForCoupon) return;
    setCouponLoading(true);
    setCouponError(null);
    setValidatedCoupon(null);
    try {
      const res = await fetch(`${API_BASE}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput,
          planId: selectedPlanForCoupon.id,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setValidatedCoupon({
          code: json.data.code,
          discountAmount: json.data.discountAmount,
          discountedPrice: json.data.discountedPrice,
        });
      } else {
        setCouponError(json.error?.message || "Geçersiz kupon kodu.");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Kupon doğrulanırken hata oluştu.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleStartCheckout = async () => {
    if (!selectedPlanForCoupon) return;
    const planId = selectedPlanForCoupon.id;
    const couponCode = validatedCoupon?.code || undefined;

    setSelectedPlanForCoupon(null);
    setCouponCodeInput("");
    setValidatedCoupon(null);
    setCouponError(null);

    await handleCheckout(planId, couponCode);
  };

  const getRemainingDays = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    const nextDate = new Date(dateStr);
    const now = new Date();
    const diffTime = nextDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const parseFeatures = (featuresJson: string | string[]) => {
    try {
      if (typeof featuresJson === "string") return JSON.parse(featuresJson) as string[];
      if (Array.isArray(featuresJson)) return featuresJson;
    } catch {
      // ignore
    }
    return [];
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Paket ve fatura bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-10 max-w-7xl mx-auto relative">

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-6 py-4 rounded-xl bg-green-500 text-white font-semibold shadow-2xl flex items-center gap-3 border border-green-400/20"
          >
            <span>✨</span>
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
          <span>⚠️</span>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-white font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Paketim ve Faturalandırma</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
          Abonelik paketinizi yönetin, faturalarınızı indirin ve kayıtlı ödeme yöntemlerinizi güncelleyin.
        </p>
      </div>

      {/* SECTION 1: MEVCUT PAKET VE ABONELİK DURUMU */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Abonelik Kartı */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between gap-6 shadow-xl">
          <div className="absolute -top-[30%] -right-[10%] w-[200px] h-[200px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-black tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full uppercase">
                Aktif Abonelik
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3 uppercase tracking-tight">
                {subscription?.planName || "FREE"} PAKETİ
              </h2>
            </div>
            <div className="text-left md:text-right">
              <span className="text-xs text-gray-500 block font-medium">Kalan Gün Sayısı</span>
              <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {getRemainingDays(subscription?.nextBillingDate)} Gün
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-gray-200 dark:border-white/5 pt-6 text-sm">
            <div>
              <span className="text-gray-500 block text-xs font-semibold">Son Ödeme Tarihi</span>
              <span className="text-gray-700 dark:text-gray-300 font-bold mt-0.5 block">
                {subscription?.nextBillingDate ? formatDate(subscription.nextBillingDate) : "Süresiz"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs font-semibold">Otomatik Yenileme</span>
              <span className={`font-bold mt-0.5 block ${subscription?.autoRenewal ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                {subscription?.autoRenewal ? "✅ Aktif" : "❌ Devre Dışı"}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-500 block text-xs font-semibold">Fatura Durumu</span>
              <span className={`font-bold mt-0.5 block uppercase ${subscription?.billingStatus === "ACTIVE" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {subscription?.billingStatus === "ACTIVE" ? "ÖDENDİ" : subscription?.billingStatus || "AKTİF"}
              </span>
            </div>
          </div>
        </div>

        {/* Kayıtlı Kart Kartı */}
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black tracking-widest text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 rounded-full uppercase">
                Ödeme Yöntemi
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3">Kayıtlı Kart Bilgisi</h3>
            </div>
            <span className="text-2xl">💳</span>
          </div>

          {subscription?.cardLastFour ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl">
                <span className="text-2xl">💳</span>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">Visa / Mastercard</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 tracking-widest">•••• •••• •••• {subscription.cardLastFour}</span>
                </div>
              </div>
              <button
                onClick={() => subscription.planId && handleCheckout(subscription.planId)}
                disabled={checkoutLoadingPlanId !== null}
                className="w-full text-center py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-primary text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-all duration-200"
              >
                {checkoutLoadingPlanId === subscription.planId ? "Yükleniyor..." : "Kayıtlı Kartı Güncelle / Değiştir"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-medium">Sistemde kayıtlı bir kredi veya banka kartınız bulunmamaktadır.</p>
              <p className="text-xs font-semibold bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-700 dark:text-amber-400">
                Aşağıdaki planlardan birini seçip ilk ödemenizi tamamlayarak kartınızı sisteme kaydedebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* SECTION 2: PAKET YÜKSELTME */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Kullanılabilir Abonelik Paketleri</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
            Salonunuzun ihtiyaçlarına en uygun paketi seçin. Paket değişikliklerinde mevcut kullanım haklarınız korunur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = subscription?.planName.toUpperCase() === plan.name.toUpperCase();
            const planFeatures = parseFeatures(plan.features);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`bg-white dark:bg-[#121212] border rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden ${
                  isCurrent ? "border-primary shadow-gold-glow" : "border-gray-200 dark:border-white/5"
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest bg-primary text-black px-2 py-0.5 rounded-full uppercase">
                    Aktif Paketiniz
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">{plan.name} Plan</h3>
                  <div className="flex items-baseline mt-4 gap-1">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{plan.price} TL</span>
                    <span className="text-gray-500 text-xs font-semibold">/ ay</span>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md block w-fit mt-2 font-bold">
                    📦 {plan.storageLimitMB} MB Medya Depolama
                  </span>

                  <ul className="flex flex-col gap-3 mt-6 text-xs text-gray-600 dark:text-gray-300 font-semibold">
                    {planFeatures.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-500 text-sm">✓</span>
                        <span>
                          {feat === "basic_booking" && "Temel Randevu Yönetimi"}
                          {feat === "1_staff" && "En Fazla 1 Personel"}
                          {feat === "unlimited_staff" && "Sınırsız Personel Ekleme"}
                          {feat === "payment_gateway" && "Online Kapora ve Ödeme"}
                          {feat === "custom_domain" && "Özel Domain Desteği (kendiadresiniz.com)"}
                          {!["basic_booking", "1_staff", "unlimited_staff", "payment_gateway", "custom_domain"].includes(feat) && feat}
                        </span>
                      </li>
                    ))}

                    <li className="flex items-center gap-2 border-t border-gray-200 dark:border-white/5 pt-3 mt-1">
                      <span>{plan.allowPortalThemes ? "✅" : "❌"}</span>
                      <span className={plan.allowPortalThemes ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
                        Premium Portal Temaları İzni
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (isCurrent) return;
                    if (plan.isFree) {
                      handleCheckout(plan.id);
                    } else {
                      setSelectedPlanForCoupon(plan);
                    }
                  }}
                  disabled={isCurrent || checkoutLoadingPlanId !== null}
                  className={`w-full text-center py-3 rounded-xl text-xs font-extrabold tracking-wider transition-all duration-200 ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/20 text-primary cursor-default"
                      : "bg-primary text-white hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-sm dark:shadow-gold-glow"
                  }`}
                >
                  {isCurrent
                    ? "Mevcut Paketiniz"
                    : checkoutLoadingPlanId === plan.id
                    ? "Başlatılıyor..."
                    : plan.isFree
                    ? "Ücretsiz Pakete Geç"
                    : "Paketi Seç ve Öde"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: FATURA GEÇMİŞİ */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-sans">Geçmiş Faturam &amp; Ödemelerim</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Yaptığınız ödemelerin listesi ve işlem durumları.</p>
        </div>

        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    <th className="p-4">Fatura Tarihi</th>
                    <th className="p-4">Plan Adı</th>
                    <th className="p-4">Ödenen Tutar</th>
                    <th className="p-4">İşlem Numarası</th>
                    <th className="p-4 text-center">Durum</th>
                    <th className="p-4 text-center">Resmi Makbuz</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-gray-500 dark:text-gray-400">{formatDate(item.paidAt)}</td>
                      <td className="p-4 text-gray-900 dark:text-white uppercase font-bold">{item.planName}</td>
                      <td className="p-4 text-gray-900 dark:text-white font-extrabold">
                        {item.originalAmount && item.originalAmount > item.amount ? (
                          <span className="flex flex-col">
                            <span className="line-through text-gray-400 dark:text-gray-500 text-[10px] font-semibold">{item.originalAmount.toFixed(2)} TL</span>
                            <span className="text-green-600 dark:text-green-400 font-extrabold">{item.amount.toFixed(2)} {item.currency || "TRY"}</span>
                          </span>
                        ) : (
                          <span>{item.amount.toFixed(2)} {item.currency || "TRY"}</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-gray-500">{item.transactionId}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "SUCCESS"
                            ? "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400"
                        }`}>
                          {item.status === "SUCCESS" ? "BAŞARILI" : "BAŞARISIZ"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {item.status === "SUCCESS" ? (
                          <a
                            href={`${API_BASE}/api/payments/history/${item.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary text-gray-600 dark:text-gray-300 hover:text-primary font-bold text-[10px] uppercase tracking-wider transition-all select-none"
                          >
                            📄 PDF Makbuz
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 font-medium">Kayıtlı ödeme veya fatura geçmişi bulunmamaktadır.</div>
          )}
        </div>
      </section>

      {/* KUPON UYGULAMA MODALI */}
      <AnimatePresence>
        {selectedPlanForCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative"
            >
              <button
                onClick={() => {
                  setSelectedPlanForCoupon(null);
                  setCouponCodeInput("");
                  setValidatedCoupon(null);
                  setCouponError(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-bold text-sm"
              >
                ✕
              </button>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  🛒 Satın Alım Detayları
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Seçilen paket için ödemeyi onaylayın veya indirim kuponu uygulayın.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold">Seçilen Paket:</span>
                  <span className="text-gray-900 dark:text-white font-extrabold uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-[10px]">
                    {selectedPlanForCoupon.name} Plan
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-white/5 pt-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Tutar:</span>
                  {validatedCoupon ? (
                    <div className="flex flex-col items-end">
                      <span className="line-through text-gray-400 dark:text-gray-500 text-xs font-bold">
                        {selectedPlanForCoupon.price.toFixed(2)} TL
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-black text-lg">
                        {validatedCoupon.discountedPrice.toFixed(2)} TL
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-black text-base">
                      {selectedPlanForCoupon.price.toFixed(2)} TL
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
                  İndirim Kuponunuz Var mı?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Örn: LANSMAN50"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleValidateCoupon}
                    disabled={couponLoading || !couponCodeInput.trim()}
                    className="px-4 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Uygula"}
                  </button>
                </div>
                {validatedCoupon && (
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1">
                    🎉 Kupon uygulandı! {validatedCoupon.discountAmount.toFixed(2)} TL tasarruf ettiniz.
                  </p>
                )}
                {couponError && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold mt-1">
                    ⚠️ {couponError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanForCoupon(null);
                    setCouponCodeInput("");
                    setValidatedCoupon(null);
                    setCouponError(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-white/10 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm dark:shadow-gold-glow flex items-center justify-center gap-2"
                >
                  Ödemeyi Başlat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D SECURE PAYMENT MODAL */}
      <AnimatePresence>
        {showModal && paymentUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Güvenli 3D Secure Ödeme Ekranı</h3>
                    <p className="text-[10px] text-gray-500">Sanal POS simülasyonu ile işleminiz doğrulanıyor</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setPaymentUrl(null);
                    loadData();
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="relative bg-gray-50 dark:bg-[#0B0B0B] w-full min-h-[550px]">
                <iframe
                  src={paymentUrl}
                  width="100%"
                  height="550px"
                  className="border-0 rounded-b-2xl w-full"
                  title="3D Secure Payment Screen"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function BillingPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
      <BillingPageContent />
    </Suspense>
  );
}
