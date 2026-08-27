"use server";

/**
 * revalidate-actions.ts
 * [PHASE 5] Next.js Cache Yönetimi
 *
 * Kuaför veya Süper Admin bir ayar değiştirdiğinde (tema, paket, randevu iptali vb.)
 * bu action'lar ilgili sayfa önbelleklerini temizler.
 *
 * Kullanım:
 *   import { revalidateStorefront, revalidateDashboard } from "@/app/revalidate-actions";
 *   await revalidateStorefront("salon-slug");
 */

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Vitrin sayfasını yenile (tema, içerik veya paket değişikliğinde çağırılır).
 * @param tenantSlug Tenant'ın URL slug'ı (örn: "mavi-salon")
 */
export async function revalidateStorefront(tenantSlug?: string) {
  if (tenantSlug) {
    // Belirli bir tenant'ın vitrin sayfasını temizle
    revalidatePath(`/${tenantSlug}`);
    revalidateTag(`storefront-${tenantSlug}`);
  } else {
    // Tüm vitrin sayfalarını temizle (Süper Admin paket değişikliği vb.)
    revalidatePath("/[tenant]", "page");
  }
}

/**
 * Dashboard sayfalarını yenile.
 * Ayarlar, takvim, müşteri listeleri gibi sayfalar için.
 */
export async function revalidateDashboard() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/services");
}

/**
 * Süper Admin panelini yenile (paket/tenant değişiklikleri).
 */
export async function revalidateSuperAdmin() {
  revalidatePath("/super-admin", "layout");
  revalidatePath("/super-admin/tenants");
  revalidatePath("/super-admin/packages");
}

/**
 * Randevu iptal/güncelleme sonrasında takvimi yenile.
 * @param tenantSlug İlgili tenant slug'ı
 */
export async function revalidateCalendar(tenantSlug?: string) {
  revalidatePath("/dashboard/calendar");
  if (tenantSlug) {
    revalidatePath(`/${tenantSlug}`);
    revalidateTag(`storefront-${tenantSlug}`);
  }
}

/**
 * Tek seferlik tüm uygulama cache'ini temizle (acil durum).
 * Yalnızca Süper Admin tarafından kullanılır.
 */
export async function revalidateAll() {
  revalidatePath("/", "layout");
}
