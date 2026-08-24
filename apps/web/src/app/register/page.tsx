"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z.object({
  name: z.string().min(3, "Salon adı en az 3 karakter olmalıdır."),
  ownerName: z.string().min(3, "Yetkili ad soyad en az 3 karakter olmalıdır."),
  phone: z.string().min(10, "Geçersiz telefon numarası. En az 10 karakter giriniz."),
  email: z.string().email("Geçersiz e-posta adresi."),
  password: z.string().min(5, "Şifre en az 5 karakter olmalıdır.")
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
    formState: { errors }
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema)
  });

  // Fetch active plans for step 2
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("http://localhost:3001/api/storefront/plans");
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
      const res = await fetch("http://localhost:3001/api/storefront/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          ownerName: data.ownerName,
          phone: data.phone,
          email: data.email,
          password: data.password
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

      const res = await fetch(`http://localhost:3001/api/payments/checkout`, {
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
    <div className="w-full max-w-lg p-8 rounded-[2.5rem] border border-gray-200 dark:border-[#a78bfa]/20 bg-white/80 dark:bg-[#120822]/80 backdrop-blur-xl shadow-2xl dark:shadow-none relative">
      {/* Glow border background */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-pink-500/10 pointer-events-none blur-sm" />

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">SALON KURULUMU</h2>
        <span className="text-[10px] font-bold tracking-widest text-purple-600 dark:text-[#a78bfa] block mt-1 uppercase">
          Adım {step} / 2: {step === 1 ? "Salon & Yönetici Bilgileri" : "Abonelik Paketi Seçimi"}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* STEP 1: Registration Form */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmitStep1)} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">Salon / Kuaför Adı *</label>
            <input
              type="text"
              placeholder="Prestij Hair Studio"
              {...register("name")}
              className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50"
            />
            {errors.name && <span className="text-red-400 text-[10px]">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">Yetkili Ad Soyad *</label>
            <input
              type="text"
              placeholder="Ahmet Yılmaz"
              {...register("ownerName")}
              className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50"
            />
            {errors.ownerName && <span className="text-red-400 text-[10px]">{errors.ownerName.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">Telefon Numarası *</label>
              <input
                type="tel"
                placeholder="0532 999 8877"
                {...register("phone")}
                className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50"
              />
              {errors.phone && <span className="text-red-400 text-[10px]">{errors.phone.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">E-Posta Adresi *</label>
              <input
                type="email"
                placeholder="ahmet@example.com"
                {...register("email")}
                className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50"
              />
              {errors.email && <span className="text-red-400 text-[10px]">{errors.email.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">Yönetici Şifresi *</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50"
            />
            {errors.password && <span className="text-red-400 text-[10px]">{errors.password.message}</span>}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Kaydı Başlat & Devam Et"
            )}
          </motion.button>
        </form>
      )}

      {/* STEP 2: Plan Selection & Checkout */}
      {step === 2 && (
        <form onSubmit={handleFinalizePlan} className="flex flex-col gap-5 text-xs font-semibold">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">Paket Seçimi</label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlan(p);
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                    selectedPlan?.id === p.id
                      ? "border-pink-500 bg-pink-500/5 shadow-md"
                      : "border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedPlan?.id === p.id ? "border-pink-500 bg-pink-500" : "border-gray-300 dark:border-white/20"
                    }`}>
                      {selectedPlan?.id === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-bold block text-gray-900 dark:text-white text-[11px]">{p.name}</span>
                      <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Kota: {p.storageLimitMB} MB</span>
                    </div>
                  </div>
                  <span className="font-black text-pink-500 dark:text-pink-400">{p.price} TL / ay</span>
                </div>
              ))}
            </div>
          </div>

          {/* POS Credit Card Form for Paid Plans */}
          {selectedPlan && !(selectedPlan.isFree || selectedPlan.price === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3.5 p-4 rounded-2xl border border-pink-500/20 bg-gray-50 dark:bg-white/[0.02]"
            >
              <div className="text-center">
                <span className="text-[10px] font-black uppercase text-pink-500 dark:text-pink-400 tracking-wider">💳 Sanal POS Güvenli Ödeme</span>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Aboneliğinizin başlatılması için <b className="text-gray-900 dark:text-white">{selectedPlan.price} TL</b> tahsil edilecektir.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    required
                    placeholder="Ahmet Yılmaz"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400">Kart Numarası</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4355 0000 0000 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                    className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400">AA/YY</label>
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
                      className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400">CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="***"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !selectedPlan}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (selectedPlan?.isFree || selectedPlan?.price === 0) ? (
              "Kurulumu Tamamla ve Giriş Yap"
            ) : (
              `Güvenli Şekilde ${selectedPlan?.price} TL Öde ve Tamamla`
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#07010e] text-gray-900 dark:text-[#eadef7] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-[#ec4899]/5 dark:bg-[#ec4899]/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/15 blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-pink-500">Yükleniyor...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

