"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { resetPasswordAction } from "../auth-actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: "error", text: "Geçersiz veya eksik token." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Şifreler eşleşmiyor." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("password", password);
      
      const res = await resetPasswordAction(formData);
      
      if (res.success) {
        setMessage({ type: "success", text: res.message || "" });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({ type: "error", text: res.error || "Bir hata oluştu." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Sunucu hatası." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#0D1B32] shadow-sm"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#0B1933] dark:text-[#F7F8FA]">Yeni Şifre Belirle</h1>
        <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-2">
          Lütfen yeni şifrenizi girin.
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-6 p-4 rounded-lg text-xs font-semibold ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border-green-200" 
              : "bg-red-50 text-red-800 border-red-200"
          } border`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-[#0B1933] dark:text-gray-200">Yeni Şifre</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0B1933] outline-none"
            placeholder="••••••••"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-[#0B1933] dark:text-gray-200">Şifre Tekrar</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0B1933] outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold text-sm"
        >
          {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#081326] flex items-center justify-center p-4">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
