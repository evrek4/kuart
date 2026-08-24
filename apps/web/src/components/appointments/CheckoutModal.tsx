import { useState } from "react";
import { motion } from "framer-motion";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentId: string;
  clientName: string;
  serviceName: string;
  price: number;
  tenantSlug: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  appointmentId,
  clientName,
  serviceName,
  price,
  tenantSlug,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CREDIT_CARD" | "TRANSFER">("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/api/appointments/${appointmentId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          paymentMethod,
          paidAmount: price,
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error?.message || "Ödeme kaydı oluşturulamadı.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold text-sm"
        >
          ✕
        </button>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Adisyon Kapat / Ödeme Al
          </h3>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
            Randevu hizmet bedelini tahsil edin ve kasaya işleyin.
          </p>
        </div>

        {/* Randevu Bilgileri */}
        <div className="bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500 dark:text-gray-400">Müşteri:</span>
            <span className="text-neutral-900 dark:text-white font-bold">{clientName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-500 dark:text-gray-400">Hizmet:</span>
            <span className="text-neutral-900 dark:text-white font-bold">{serviceName}</span>
          </div>
          <div className="border-t border-neutral-200 dark:border-white/5 pt-2 flex justify-between text-sm items-center">
            <span className="text-neutral-500 dark:text-gray-400 font-bold">Hizmet Tutarı:</span>
            <span className="text-primary font-black text-lg">{price} TL</span>
          </div>
        </div>

        {/* Ödeme Yöntemi */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold text-neutral-600 dark:text-gray-400">
            Ödeme Yöntemi Seçin
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "CASH", label: "💵 Nakit" },
              { id: "CREDIT_CARD", label: "💳 Kart" },
              { id: "TRANSFER", label: "🏦 Havale" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as any)}
                className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === method.id
                    ? "bg-primary text-white border-primary shadow-sm dark:shadow-gold-glow"
                    : "bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-gray-300 border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"
                }`}
              >
                <span>{method.label.split(" ")[0]}</span>
                <span>{method.label.split(" ")[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-neutral-700 dark:text-gray-300"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm dark:shadow-gold-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Tahsil Et"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
