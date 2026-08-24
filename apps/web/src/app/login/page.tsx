"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
        setIsLoading(false);
        return;
      }

      const { role, tenantId, token } = json.data;

      // Tüm eski çerezleri temizle ve JWT Token kaydet
      document.cookie = `user-role=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `tenant-id=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `kuafor-token=${token}; path=/; max-age=604800; SameSite=Lax`; // 7 gün

      // Rol bazlı yönlendirme
      if (role === "SUPER_ADMIN") {
        router.push(callbackUrl && callbackUrl.startsWith("/super-admin") ? callbackUrl : "/super-admin");
      } else {
        // SALON_OWNER veya SALON_STAFF → dashboard'a
        router.push(callbackUrl && callbackUrl.startsWith("/dashboard") ? callbackUrl : "/dashboard");
      }

      router.refresh();
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md p-8 rounded-[2rem] border border-gray-200 dark:border-[#a78bfa]/20 bg-white/80 dark:bg-[#120822]/80 backdrop-blur-xl shadow-2xl dark:shadow-none relative"
    >
      {/* Glow Border Effect */}
      <div className="absolute inset-0 rounded-[2rem] border border-pink-500/10 pointer-events-none blur-sm" />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 uppercase">
          KUAFOR.ART
        </h1>
        <span className="text-[10px] font-bold tracking-widest text-purple-600 dark:text-[#a78bfa] block mt-1 uppercase">
          Yönetici Portalı Girişi
        </span>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed"
        >
          ⚠️ {error}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">E-Posta Adresi</label>
          <input
            id="login-email"
            type="email"
            required
            placeholder="salon@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Şifre</label>
          <input
            id="login-password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500/50 transition-colors"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          id="login-submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-extrabold text-sm hover:brightness-110 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sisteme Giriş Yap"
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        Tüm kuaförler ve süper admin bu ekrandan giriş yapar.<br />
        <span className="text-purple-600/70 dark:text-[#a78bfa]/60">Rolünüze göre otomatik yönlendirme yapılır.</span>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#07010e] text-gray-900 dark:text-[#eadef7] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Neo-Glow Backgrounds */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-[#ec4899]/5 dark:bg-[#ec4899]/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/15 blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#a78bfa]">Yükleniyor...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

