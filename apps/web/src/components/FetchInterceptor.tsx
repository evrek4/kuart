"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

/**
 * Global Fetch Interceptor
 * 1. Intercepts all client-side window.fetch calls to dynamically resolve API host
 *    (e.g., if page loaded via 192.168.1.102:3010, rewrites localhost:3001 to 192.168.1.102:3001).
 * 2. Automatically attaches the 'kuafor-token' from cookies as Authorization Bearer header.
 * 3. [PHASE 5] Global HTTP status code handling:
 *    - 429 Too Many Requests → kullanıcı dostu rate-limit toast uyarısı
 *    - 401 / 403 Unauthorized/Forbidden → /login yönlendirmesi
 *    Not: 409 Conflict, bileşen düzeyinde (BookingModal) özel olarak ele alınır.
 */
export default function FetchInterceptor({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    // Aynı interceptor'ın birden fazla kez monte edilmesini engelle
    if ((window as any).__fetchInterceptorInstalled) return;
    (window as any).__fetchInterceptorInstalled = true;

    window.fetch = async (...args) => {
      let [resource, config] = args;
      const currentHost = window.location.hostname;

      // 1. Dynamic API Host Rewriting for Mobile / Network devices
      if (typeof resource === "string") {
        if (
          currentHost &&
          currentHost !== "localhost" &&
          currentHost !== "127.0.0.1"
        ) {
          if (
            resource.includes("localhost:3001") ||
            resource.includes("127.0.0.1:3001")
          ) {
            const protocol =
              window.location.protocol === "https:" ? "https:" : "http:";
            resource = resource
              .replace(
                "http://localhost:3001",
                `${protocol}//${currentHost}:3001`
              )
              .replace(
                "https://localhost:3001",
                `${protocol}//${currentHost}:3001`
              )
              .replace(
                "http://127.0.0.1:3001",
                `${protocol}//${currentHost}:3001`
              );
          }
        }
      }

      // 2. Attach Authorization Token to API requests
      if (
        typeof resource === "string" &&
        (resource.includes("/api/") || resource.includes(":3001"))
      ) {
        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find((row) =>
          row.startsWith("kuafor-token=")
        );
        const token = tokenCookie ? tokenCookie.split("=")[1] : null;

        if (token) {
          config = config || {};
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }

      const response = await originalFetch(resource, config);

      // 3. [PHASE 5] Global HTTP Error Interception
      // Sadece API isteklerini işle; Next.js dahili isteklerini atlat
      if (
        typeof resource === "string" &&
        (resource.includes("/api/") || resource.includes(":3001")) &&
        !response.ok
      ) {
        const status = response.status;

        // 429 – Rate Limit
        if (status === 429) {
          // OTP veya giriş sayfasındaki özel mesajları göster
          let rateLimitMsg =
            "Çok fazla istek attınız. Lütfen 3 dakika bekleyip tekrar deneyin.";
          try {
            const cloned = response.clone();
            const json = await cloned.json();
            if (json?.error?.message) rateLimitMsg = json.error.message;
          } catch {
            // JSON parse başarısız, varsayılan mesajı kullan
          }
          toast.warning(rateLimitMsg, {
            id: "rate-limit-toast", // Duplicate'leri engelle
            duration: 8000,
            description: "Güvenlik sistemimiz devreye girdi.",
          });
        }

        // 401 – Unauthorized
        if (status === 401) {
          // /api/auth/login gibi auth endpoint'lerinde redirect tetiklenmesin
          const isAuthEndpoint =
            typeof resource === "string" &&
            (resource.includes("/auth/login") ||
              resource.includes("/auth/register") ||
              resource.includes("/auth/forgot") ||
              resource.includes("/auth/reset"));

          if (!isAuthEndpoint) {
            toast.error("Oturum süreniz doldu.", {
              id: "auth-redirect-toast",
              description: "Yeniden giriş yapılıyor...",
              duration: 3000,
            });
            setTimeout(() => {
              const currentPath = window.location.pathname;
              router.push(
                `/login?callbackUrl=${encodeURIComponent(currentPath)}`
              );
            }, 1500);
          }
        }

        // 403 – Forbidden / Spoofing girişimi
        if (status === 403) {
          toast.error("Bu işlem için yetkiniz bulunmuyor.", {
            id: "forbidden-toast",
            description: "Yeniden giriş yapılıyor...",
            duration: 3000,
          });
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        }
      }

      return response;
    };

    // Cleanup: sayfa ayrıldığında interceptor'ı sıfırla
    return () => {
      window.fetch = originalFetch;
      (window as any).__fetchInterceptorInstalled = false;
    };
  }, [router]);

  return <>{children}</>;
}
