"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("sessionId") || "";
  const planId = searchParams.get("planId") || "";
  const planName = searchParams.get("planName") || "PRO";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const tenantId = searchParams.get("tenantId") || "";
  const couponCode = searchParams.get("couponCode") || "";
  const originalAmount = parseFloat(searchParams.get("originalAmount") || String(amount));

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [step, setStep] = useState<"form" | "otp" | "processing" | "success" | "error">("form");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").substring(0, 4);
    if (digits.length >= 3) return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    return digits;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 16) {
      setError("Geçerli bir 16 haneli kart numarası giriniz.");
      return;
    }
    if (!cardExpiry.includes("/") || cardExpiry.length < 5) {
      setError("Son kullanma tarihi MM/YY formatında giriniz.");
      return;
    }
    if (cardCvv.length < 3) {
      setError("CVV 3 haneli olmalıdır.");
      return;
    }
    if (!cardHolder.trim()) {
      setError("Kart üzerindeki ismi giriniz.");
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // OTP doğrulama — Demo: "123456" her zaman geçerli
    if (otp !== "123456") {
      setError("Doğrulama kodu hatalı. Demo için: 123456");
      return;
    }

    setStep("processing");

    try {
      const cardLastFour = cardNumber.replace(/\s/g, "").slice(-4);

      // Ödeme onayını API'ye gönder
      const res = await fetch(`${API_BASE}/api/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tenantId,
          planId,
          planName,
          amount,
          originalAmount: originalAmount !== amount ? originalAmount : null,
          couponCode: couponCode || null,
          cardLastFour,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStep("success");
        setTimeout(() => {
          // Parent window'daki billing sayfasına başarı bildirimi gönder
          if (window.parent !== window) {
            window.parent.location.href = "/dashboard/billing?payment=success";
          } else {
            router.replace("/dashboard/billing?payment=success");
          }
        }, 2500);
      } else {
        throw new Error(json.error?.message || "Ödeme onaylanamadı.");
      }
    } catch (err: any) {
      setStep("error");
      setError(err.message || "Ödeme işlemi sırasında hata oluştu.");
    }
  };

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-200">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900">İşleminiz Doğrulanıyor</h2>
          <p className="text-sm text-gray-500 mt-1">Bankanızla bağlantı sağlanıyor, lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Ödeme Başarılı!</h2>
          <p className="text-sm text-gray-500 mt-1">
            <strong>{planName}</strong> paketine geçişiniz tamamlandı. Yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Ödeme Başarısız</h2>
          <p className="text-sm text-red-500 mt-1">{error}</p>
          <button
            onClick={() => { setStep("form"); setError(null); setOtp(""); }}
            className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <div>
              <p className="text-xs font-black text-black uppercase tracking-widest">3D Secure Simülatörü</p>
              <p className="text-[10px] text-black/60 font-medium">Demo Sanal POS Ortamı</p>
            </div>
          </div>
          <span className="text-xs font-black text-black bg-black/10 px-2 py-1 rounded-full">TEST</span>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Ödeme Tutarı</p>
            <div className="flex items-center gap-2 mt-0.5">
              {originalAmount > amount && (
                <span className="text-xs text-gray-400 line-through font-medium">{originalAmount.toFixed(2)} TL</span>
              )}
              <span className="text-xl font-black text-gray-900">{amount.toFixed(2)} TL</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Plan</p>
            <p className="text-sm font-black text-gray-900 uppercase">{planName}</p>
          </div>
        </div>

        <div className="p-4">
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Son Kullanma
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 bg-white"
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="***"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Kart Üzerindeki İsim
                </label>
                <input
                  type="text"
                  placeholder="AD SOYAD"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 bg-white"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 p-2 rounded-lg">
                  ⚠️ {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 text-black rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-yellow-500 active:scale-95 transition-all mt-1"
              >
                Ödemeyi Onayla →
              </button>
              <p className="text-center text-[10px] text-gray-400 font-medium">
                Bu sayfa bir demo ortamıdır. Gerçek kart bilgisi girmeyin.
              </p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">SMS Doğrulama</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kayıtlı telefon numaranıza gönderilen 6 haneli kodu girin.
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                  🧪 Demo kodu: <strong>123456</strong>
                </p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl font-mono tracking-[1rem] text-center text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 bg-white"
              />
              {error && (
                <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-200 p-2 rounded-lg text-center">
                  ⚠️ {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 text-black rounded-xl font-extrabold text-sm uppercase tracking-wider hover:bg-yellow-500 active:scale-95 transition-all"
              >
                Doğrula ve Öde
              </button>
              <button
                type="button"
                onClick={() => { setStep("form"); setError(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 font-semibold text-center transition-colors"
              >
                ← Kart bilgilerine dön
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentSimulatorContent />
    </Suspense>
  );
}
