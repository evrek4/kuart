import { unstable_noStore as noStore } from "next/cache";
import { slugify } from "@/lib/slugify";
import DynamicStorefront from "./DynamicStorefront";

// Next.js Server Side Cache Disabler
// [PHASE 5] unstable_noStore() garantili olarak route cache'i devre dışı bırakır
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export interface SalonData {
  name: string;
  description: string;
  theme: "light" | "dark";
  themeTemplate: string;
  portalThemeTier?: "BASIC" | "GOLD" | "PREMIUM";
  portalColorMode?: "DARK" | "LIGHT";
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  instagramUrl: string;
  coverImage: string;
  logo?: string | null;
  globalPaymentPolicy?: string;
  defaultDepositAmount?: number;
  services: Service[];
  staff: Staff[];
  gallery: string[];
}

const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getStorefrontData(tenantParam: string): Promise<any | null> {
  // [PHASE 5] Her request için cache'i kesinlikle devre dışı bırak
  noStore();

  if (!tenantParam) return null;

  try {
    const raw = decodeURIComponent(tenantParam).trim();
    const cleanSlug = slugify(raw);

    console.log(`[Storefront SSR]: Fetching salon data for param '${raw}' (cleanSlug: '${cleanSlug}')`);

    // 1. Doğrudan gelen parametre ile sorgula
    let res = await fetch(`${API_BASE}/api/storefront/${encodeURIComponent(raw)}`, {
      cache: "no-store",
    });

    // 2. Bulunamadıysa temiz slugify edilmiş hali ile sorgula
    if (!res.ok && cleanSlug && cleanSlug !== raw.toLowerCase()) {
      res = await fetch(`${API_BASE}/api/storefront/${encodeURIComponent(cleanSlug)}`, {
        cache: "no-store",
      });
    }

    if (!res.ok) {
      console.error(`[Storefront SSR Error]: Fetch failed with status ${res.status} for tenant '${raw}'`);
      return null;
    }

    const json = await res.json();
    console.log(`[Storefront SSR Response]: Data loaded successfully = ${Boolean(json?.success && json?.data)}`);
    return json?.success ? json.data : null;
  } catch (error) {
    console.error("[Storefront SSR Exception]:", error);
    return null;
  }
}

export default async function StorefrontPage({
  params,
}: {
  params: { tenant?: string; slug?: string } | Promise<{ tenant?: string; slug?: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const rawTenant = resolvedParams?.tenant || resolvedParams?.slug || "";
  const data = await getStorefrontData(rawTenant);

  if (!data || !data.tenant) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center font-sans p-6 text-center relative overflow-hidden">
        <div className="absolute top-[20%] w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-red-500 uppercase tracking-wider mb-2">SALON BULUNAMADI</h1>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Aradığınız kuaför salonu (`{rawTenant || "Bilinmeyen"}`) sistemde kayıtlı değil veya pasif durumda olabilir.
        </p>
        <a href="/" className="px-6 py-2.5 rounded-full border border-white/10 hover:border-white/40 text-xs font-bold transition-all bg-white/5 z-10">
          Ana Sayfaya Dön
        </a>
      </div>
    );
  }

  return <DynamicStorefront data={data} />;
}
