"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import { TURKEY_PROVINCES } from "@/data/turkey-provinces";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const registerSchema = z.object({
  name: z.string().min(3, "Salon adı en az 3 karakter olmalıdır."),
  ownerName: z.string().min(3, "Yetkili ad soyad en az 3 karakter olmalıdır."),
  phone: z.string().min(10, "Geçersiz telefon numarası. En az 10 karakter giriniz."),
  email: z.string().email("Geçersiz e-posta adresi."),
  password: z.string().min(5, "Şifre en az 5 karakter olmalıdır."),
  province: z.string().min(1, "İl seçimi zorunludur."),
  district: z.string().min(1, "İlçe seçimi zorunludur."),
  fullAddress: z.string().min(10, "Açık adres en az 10 karakter olmalıdır.")
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  storageLimitMB: number;
  features: {
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    emailEnabled?: boolean;
    customDomainAllowed?: boolean;
    customPOSAllowed?: boolean;
  };
  isFree: boolean;
  isActive: boolean;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get("plan") || "";

  const [step, setStep] = useState(1);
  const [createdTenantId, setCreatedTenantId] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // POS payment form states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Zod & React Hook Form validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema)
  });

  // İl/İlçe dinamik listesi
  const selectedProvince = watch("province");
  const availableDistricts = selectedProvince
    ? (TURKEY_PROVINCES.find((p) => p.name === selectedProvince)?.districts ?? [])
    : [];

  // İl değişince ilçeyi sıfırla
  useEffect(() => {
    setValue("district", "");
  }, [selectedProvince, setValue]);

  // Fetch active plans for step 2
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch(`${API_URL}/api/storefront/plans`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const activePlans = (json.data || []).filter((p: SubscriptionPlan) => p.isActive !== false);
            setPlans(activePlans);

            // Default select the plan from url query params if valid
            if (initialPlanId) {
              const matched = activePlans.find((p: SubscriptionPlan) => p.id === initialPlanId);
              if (matched) setSelectedPlan(matched);
            } else if (activePlans.length > 0) {
              // Default to free or first plan
              const freePlan = activePlans.find((p: SubscriptionPlan) => p.isFree);
              setSelectedPlan(freePlan || activePlans[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load plans:", err);
      }
    }
    fetchPlans();
  }, [initialPlanId]);

  // Step 1: Submit Register Form
  const onSubmitStep1 = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/storefront/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          ownerName: data.ownerName,
          phone: data.phone,
          email: data.email,
          password: data.password,
          province: data.province,
          district: data.district,
          fullAddress: data.fullAddress
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCreatedTenantId(json.data.tenantId);
        
        // Tüm eski çerezleri temizle ve JWT Token kaydet
        document.cookie = `user-role=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `tenant-id=; path=/; max-age=0; SameSite=Lax`;
        document.cookie = `kuafor-token=${json.data.token}; path=/; max-age=604800; SameSite=Lax`;

        // Advance to Step 2
        setStep(2);
      } else {
        setErrorMsg(json.error?.message || "Kayıt sırasında bir hata oluştu.");
      }
    } catch (err) {
      setErrorMsg("Bağlantı hatası: Kayıt işlemi gerçekleştirilemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Assign Plan and Redirect
  const handleFinalizePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdTenantId || !selectedPlan) return;

    const isPlanFree = selectedPlan.isFree || selectedPlan.price === 0;

    // If it's a paid plan, require POS card details
    if (!isPlanFree && (!cardName || !cardNumber || !cardExpiry || !cardCvv)) {
      setErrorMsg("Lütfen ödemenin gerçekleştirilmesi için kredi kartı bilgilerini eksiksiz girin.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isPlanFree) {
        // Free plan is already assigned during step 1. Redirect to dashboard.
        router.refresh();
        router.push("/dashboard");
        return;
      }

      // If paid, call real payment checkout
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("kuafor-token="))
        ?.split("=")[1];

      const res = await fetch(`${API_URL}/api/payments/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ planId: selectedPlan.id, tenantId: createdTenantId })
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.paymentPageUrl) {
        window.location.href = json.data.paymentPageUrl;
      } else {
        setErrorMsg(json.error?.message || "Paket ödemesi başlatılamadı.");
      }
    } catch (err) {
      setErrorMsg("Plan kurulumu sırasında bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#0D1B32] shadow-sm relative">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-tight">SALON KURULUMU</h2>
        <span className="text-[10px] font-bold tracking-widest text-lightText-secondary dark:text-darkText-secondary block mt-1 uppercase">
          Adım {step} / 2: {step === 1 ? "Salon & Yönetici Bilgileri" : "Abonelik Paketi Seçimi"}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800/50 text-xs font-semibold leading-relaxed">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* STEP 1: Registration Form */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmitStep1)} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Salon / Kuaför Adı *</label>
            <input
              type="text"
              placeholder="Prestij Hair Studio"
              {...register("name")}
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
            />
            {errors.name && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Yetkili Ad Soyad *</label>
            <input
              type="text"
              placeholder="Ahmet Yılmaz"
              {...register("ownerName")}
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
            />
            {errors.ownerName && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.ownerName.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Telefon Numarası *</label>
              <input
                type="tel"
                maxLength={11}
                placeholder="05329998877"
                {...register("phone", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }
                })}
                className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
              />
              {errors.phone && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.phone.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">E-Posta Adresi *</label>
              <input
                type="email"
                placeholder="ahmet@example.com"
                {...register("email")}
                className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
              />
              {errors.email && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.email.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Yönetici Şifresi *</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
            />
            {errors.password && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.password.message}</span>}
          </div>

          {/* ── Konum Bilgileri ── */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-[10px] uppercase font-black text-[#0B1933] dark:text-gray-400 tracking-widest mb-3">📍 Salon Konumu</p>
            <div className="grid grid-cols-2 gap-4">
              {/* İl */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">İl *</label>
                <select
                  {...register("province")}
                  className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
                >
                  <option value="">İl seçin...</option>
                  {TURKEY_PROVINCES.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                {errors.province && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.province.message}</span>}
              </div>

              {/* İlçe */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">İlçe *</label>
                <select
                  {...register("district")}
                  disabled={!selectedProvince || availableDistricts.length === 0}
                  className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedProvince ? "İlçe seçin..." : "Önce il seçin"}</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.district && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.district.message}</span>}
              </div>
            </div>

            {/* Açık Adres */}
            <div className="flex flex-col gap-1.5 mt-3">
              <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Açık Adres *</label>
              <textarea
                {...register("fullAddress")}
                rows={2}
                placeholder="Mahalle, sokak, kapı no ve daire bilgilerini giriniz..."
                className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-xs text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933] resize-none"
              />
              {errors.fullAddress && <span className="text-red-500 dark:text-red-400 text-[10px]">{errors.fullAddress.message}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-lg bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold text-xs tracking-wider uppercase transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mt-4 shadow-sm"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              "Kaydı Başlat & Devam Et"
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Plan Selection & Checkout */}
      {step === 2 && (
        <form onSubmit={handleFinalizePlan} className="flex flex-col gap-5 text-xs font-semibold">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Paket Seçimi</label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlan(p);
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex justify-between items-center ${
                    selectedPlan?.id === p.id
                      ? "border-[#0B1933] bg-gray-50 dark:border-white/50 dark:bg-dark-highlight shadow-sm"
                      : "border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] hover:bg-gray-50 dark:hover:bg-[#0A111E]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedPlan?.id === p.id ? "border-[#0B1933] bg-[#0B1933] dark:border-white dark:bg-white" : "border-gray-300 dark:border-white/20"
                    }`}>
                      {selectedPlan?.id === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0B1933]" />}
                    </div>
                    <div>
                      <span className="font-bold block text-lightText-primary dark:text-darkText-primary text-[11px]">{p.name}</span>
                      <span className="text-[9px] text-lightText-secondary dark:text-darkText-secondary font-medium">Kota: {p.storageLimitMB} MB</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B1933] dark:text-[#F7F8FA]">{p.price} TL / ay</span>
                </div>
              ))}
            </div>
          </div>
          {/* POS Credit Card Form for Paid Plans */}
          {selectedPlan && !(selectedPlan.isFree || selectedPlan.price === 0) && (
            <div
              className="flex flex-col gap-3.5 p-4 rounded-lg border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#081326]"
            >
              <div className="text-center">
                <span className="text-[10px] font-black uppercase text-[#0B1933] dark:text-[#F7F8FA] tracking-wider">💳 Sanal POS Güvenli Ödeme</span>
                <p className="text-[9px] text-lightText-secondary dark:text-darkText-secondary mt-0.5">
                  Aboneliğinizin başlatılması için <b className="text-lightText-primary dark:text-darkText-primary">{selectedPlan.price} TL</b> tahsil edilecektir.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    required
                    placeholder="Ahmet Yılmaz"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-white dark:bg-[#0A111E] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-[11px] text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-[#0B1933] dark:text-gray-200">Kart Numarası</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4355 0000 0000 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                    className="bg-white dark:bg-[#0A111E] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-[11px] text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-[#0B1933] dark:text-gray-200">AA/YY</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                        setCardExpiry(val);
                      }}
                      className="bg-white dark:bg-[#0A111E] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-[11px] text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-[#0B1933] dark:text-gray-200">CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="***"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      className="bg-white dark:bg-[#0A111E] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-[11px] text-[#0B1933] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-[#0B1933]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !selectedPlan}
            className="w-full py-3.5 rounded-lg bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold text-xs tracking-wider uppercase transition-opacity hover:opacity-90 flex items-center justify-center gap-2 mt-2 shadow-sm"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (selectedPlan?.isFree || selectedPlan?.price === 0) ? (
              "Kurulumu Tamamla ve Giriş Yap"
            ) : (
              `Güvenli Şekilde ${selectedPlan?.price} TL Öde ve Tamamla`
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#081326] text-lightText-primary dark:text-darkText-primary font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <Navbar />
      <div className="pt-20 w-full flex items-center justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#0B1933] dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#0B1933] dark:text-white">Yükleniyor...</p>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

