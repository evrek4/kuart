import React from "react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface DashboardData {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  totalMediaBytes: number;
  logs: Array<{
    message: string;
    timestamp: string;
  }>;
}

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json.data;
    }
    return null;
  } catch (err) {
    console.error("Dashboard fetch failed:", err);
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function SuperAdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      title: "Toplam Salon",
      value: data?.totalTenants ?? 0,
      sub: `${data?.activeTenants ?? 0} Aktif Salon`,
      icon: "🏪",
      glow: "border-pink-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
      iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    },
    {
      title: "Platform Toplam Ciro",
      value: `${(data?.totalRevenue ?? 0).toLocaleString("tr-TR")} TL`,
      sub: "Net tahsilat tutarı",
      icon: "💰",
      glow: "border-purple-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(167,139,250,0.15)]",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Bulut Depolama (R2)",
      value: formatBytes(data?.totalMediaBytes ?? 0),
      sub: "Toplam medya galerisi boyutu",
      icon: "☁️",
      glow: "border-blue-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-3xl border border-purple-200 dark:border-[#a78bfa]/10 bg-white/90 dark:bg-[#0c051a]/60 shadow-sm backdrop-blur-xl overflow-hidden flex flex-col gap-2 transition-colors">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-purple-500/5 blur-[50px] pointer-events-none" />
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">KUAfor.ART KOKPİT</h1>
        <p className="text-xs text-neutral-500 dark:text-gray-400 leading-relaxed max-w-xl">
          Platform genelindeki tüm salonların durumunu, fatura hareketlerini ve altyapı ayarlarını bu panel üzerinden merkezi olarak denetleyebilirsiniz.
        </p>
      </div>

      {/* Stats Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`p-6 rounded-3xl border bg-white dark:bg-[#120822]/60 shadow-sm backdrop-blur-md flex flex-col gap-4 transition-colors ${stat.glow}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</span>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${stat.iconBg}`}>
                {stat.icon}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-neutral-500 dark:text-gray-400 font-semibold mt-1">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Two Columns (Logs & Action triggers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Recent Activities */}
        <div className="md:col-span-2 p-6 rounded-3xl border border-gray-200 dark:border-[#a78bfa]/10 bg-white dark:bg-[#120822]/60 shadow-sm backdrop-blur-md flex flex-col gap-6 transition-colors">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider">Son Sistem Hareketleri (Log)</h3>
            <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-0.5">Platform genelinde oluşan son 5 işlem kaydı.</p>
          </div>

          <div className="flex flex-col gap-4">
            {data?.logs && data.logs.length > 0 ? (
              data.logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.01] flex justify-between items-start gap-4 text-xs"
                >
                  <div className="flex gap-3">
                    <span className="text-purple-600 dark:text-purple-400">⚡</span>
                    <span className="font-medium text-neutral-700 dark:text-gray-300">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString("tr-TR")}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-gray-500">Henüz kaydedilmiş bir hareket bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* Right Column: Platform Fast Controls */}
        <div className="p-6 rounded-3xl border border-gray-200 dark:border-[#a78bfa]/10 bg-white dark:bg-[#120822]/60 shadow-sm backdrop-blur-md flex flex-col gap-6 transition-colors">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider">Hızlı İşlemler</h3>
            <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-0.5">Platform operasyonel kontrolleri.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Direct Trigger to run billingCheck */}
            <form action="http://localhost:3001/api/admin/billing-check" method="POST" target="_blank" className="w-full">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-400 font-bold text-xs tracking-wider uppercase transition-all shadow-sm text-center block"
              >
                Fatura Downgrade Worker Çalıştır
              </button>
            </form>
            <p className="text-[10px] text-neutral-500 dark:text-gray-500 leading-normal">
              Bu buton fatura tarihi geçen salonları otomatik Ücretsiz plana düşüren gecelik fatura kontrol servisini (worker) manuel olarak tetikler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
