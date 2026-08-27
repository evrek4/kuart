/**
 * apiError.ts
 * Merkezi API hata yönetimi yardımcı fonksiyonları.
 * Backend'den gelen HTTP durum kodlarını (429, 409, 401, 403)
 * kullanıcı dostu mesajlara dönüştürür.
 */

export interface ApiErrorResult {
  message: string;
  code: number;
  shouldRedirect?: string;
  keepModalOpen?: boolean;
  refreshSlots?: boolean;
}

/**
 * HTTP durum koduna göre kullanıcı dostu hata mesajı üretir.
 * Toast/Sonner sistemine doğrudan geçirilebilir.
 */
export function parseApiError(status: number, json?: any): ApiErrorResult {
  const serverMessage = json?.error?.message || json?.message || null;

  switch (status) {
    case 429:
      return {
        code: 429,
        message:
          serverMessage ||
          "Çok fazla istek attınız. Lütfen 3 dakika bekleyip tekrar deneyin.",
        keepModalOpen: true,
      };

    case 409:
      return {
        code: 409,
        message:
          serverMessage ||
          "Seçtiğiniz saat dilimi az önce doldu, lütfen başka bir saat seçin.",
        keepModalOpen: true,
        refreshSlots: true,
      };

    case 401:
      return {
        code: 401,
        message: serverMessage || "Oturum süreniz doldu. Yeniden giriş yapılıyor...",
        shouldRedirect: "/login",
      };

    case 403:
      return {
        code: 403,
        message:
          serverMessage ||
          "Bu işlem için yetkiniz bulunmuyor. Yeniden giriş yapılıyor...",
        shouldRedirect: "/login",
      };

    case 500:
      return {
        code: 500,
        message: serverMessage || "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      };

    default:
      return {
        code: status,
        message: serverMessage || "Beklenmeyen bir hata oluştu.",
      };
  }
}

/**
 * fetch() response'unu kontrol eder; hata varsa ApiErrorResult döner,
 * başarılıysa null döner.
 */
export async function checkApiResponse(res: Response): Promise<ApiErrorResult | null> {
  if (res.ok) return null;

  let json: any = null;
  try {
    json = await res.clone().json();
  } catch {
    // JSON parse edilemedi, sadece status kodu kullanılır
  }

  return parseApiError(res.status, json);
}
