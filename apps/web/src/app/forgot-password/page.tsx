"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { forgotPasswordAction } from "../auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      
      const res = await forgotPasswordAction(formData);
      
      if (res.success) {
        setMessage({ type: "success", text: res.message || "" });
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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#081326] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#0D1B32] shadow-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#0B1933] dark:text-[#F7F8FA]">Şifremi Unuttum</h1>
          <p className="text-xs text-lightText-secondary dark:text-darkText-secondary mt-2">
            E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
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
            <label className="text-xs uppercase font-bold text-[#0B1933] dark:text-gray-200">E-Posta Adresi</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#0B1933] outline-none"
              placeholder="E-posta adresiniz"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold text-sm"
          >
            {isLoading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/login" className="text-xs font-semibold text-primary hover:underline">Giriş Ekranına Dön</a>
        </div>
      </motion.div>
    </div>
  );
}
