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
      className="w-full max-w-md p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#0D1B32] shadow-sm relative"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-[#0B1933] dark:text-[#F7F8FA] uppercase">
          KUAFOR.ART
        </h1>
        <span className="text-[10px] font-bold tracking-widest text-lightText-secondary dark:text-darkText-secondary block mt-1 uppercase">
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
          <label className="text-xs uppercase font-bold text-lightText-secondary dark:text-darkText-secondary tracking-wider">E-Posta Adresi</label>
          <input
            id="login-email"
            type="email"
            required
            placeholder="salon@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white dark:bg-[#081326] border border-borderlight dark:border-dark-border rounded-lg px-4 py-3.5 text-sm text-lightText-primary dark:text-darkText-primary focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-white/20 focus:border-[#0B1933] dark:focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-lightText-secondary dark:text-darkText-secondary tracking-wider">Şifre</label>
          <input
            id="login-password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white dark:bg-[#081326] border border-borderlight dark:border-dark-border rounded-lg px-4 py-3.5 text-sm text-lightText-primary dark:text-darkText-primary focus:outline-none focus:ring-1 focus:ring-[#0B1933] dark:focus:ring-white/20 focus:border-[#0B1933] dark:focus:border-white/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-lg bg-[#0B1933] text-white dark:bg-[#F7F8FA] dark:text-[#0B1933] font-bold text-sm transition-opacity hover:opacity-90 shadow-sm flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sisteme Giriş Yap"
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-lightText-secondary dark:text-darkText-secondary leading-relaxed">
        Tüm kuaförler ve süper admin bu ekrandan giriş yapar.<br />
        <span className="opacity-80">Rolünüze göre otomatik yönlendirme yapılır.</span>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#081326] text-lightText-primary dark:text-darkText-primary font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0B1933] dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest">Yükleniyor...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

