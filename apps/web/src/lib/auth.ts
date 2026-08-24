/**
 * auth.ts — İstemci Taraflı JWT Yardımcı Fonksiyonları
 *
 * Bu modül, `kuafor-token` cookie'sini doğrulamadan decode ederek
 * dashboard bileşenlerinin kendi tenant bilgilerine güvenli erişmesini sağlar.
 *
 * NOT: Bu fonksiyonlar JWT imzasını doğrulamaz (bu sunucu görevi).
 * Amacı salt okunur UI verisi sağlamaktır.
 */

export interface DecodedToken {
  userId: string;
  role: string;
  tenantId: string | null;
  email: string;
  tenantSlug: string | null;
}

/**
 * Tarayıcı cookie'lerinden `kuafor-token` değerini okur.
 * Sunucu tarafında (SSR) çalışırken null döner.
 */
export function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("kuafor-token="));
  return match ? match.split("=")[1] : null;
}

/**
 * Verilen JWT token string'ini decode eder ve payload'ı döner.
 * İmza doğrulaması yapılmaz — UI gösterimi için kullanılır.
 * Geçersiz token'da null döner.
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64url → base64 dönüşümü
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return {
      userId: payload.userId || "",
      role: payload.role || "",
      tenantId: payload.tenantId || null,
      email: payload.email || "",
      tenantSlug: payload.tenantSlug || null,
    };
  } catch {
    return null;
  }
}

/**
 * Cookie'deki token'dan mevcut kullanıcının tenant bilgisini döner.
 * Token yoksa veya geçersizse null döner.
 */
export function getCurrentTenantInfo(): DecodedToken | null {
  const token = getTokenFromCookie();
  if (!token) return null;
  return decodeToken(token);
}
