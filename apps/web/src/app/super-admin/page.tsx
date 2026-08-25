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

const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

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
      glow: "border-borderlight dark:border-dark-border shadow-none",
      iconBg: "bg-gray-100 dark:bg-[#0A111E] text-[#0B1933] dark:text-[#F7F8FA]",
    },
    {
      title: "Platform Toplam Ciro",
      value: `${(data?.totalRevenue ?? 0).toLocaleString("tr-TR")} TL`,
      sub: "Net tahsilat tutarı",
      icon: "💰",
      glow: "border-borderlight dark:border-dark-border shadow-none",
      iconBg: "bg-gray-100 dark:bg-[#0A111E] text-[#0B1933] dark:text-[#F7F8FA]",
    },
    {
      title: "Bulut Depolama (R2)",
      value: formatBytes(data?.totalMediaBytes ?? 0),
      sub: "Toplam medya galerisi boyutu",
      icon: "☁️",
      glow: "border-borderlight dark:border-dark-border shadow-none",
      iconBg: "bg-gray-100 dark:bg-[#0A111E] text-[#0B1933] dark:text-[#F7F8FA]",
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome Banner */}
      <div className="p-8 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#0D1B32] shadow-sm flex flex-col gap-2 transition-colors">
        <h1 className="text-2xl font-black text-[#0B1933] dark:text-[#F7F8FA] uppercase tracking-tight">KUAfor.ART KOKPİT</h1>
        <p className="text-xs text-lightText-secondary dark:text-darkText-secondary leading-relaxed max-w-xl">
          Platform genelindeki tüm salonların durumunu, fatura hareketlerini ve altyapı ayarlarını bu panel üzerinden merkezi olarak denetleyebilirsiniz.
        </p>
      </div>

      {/* Stats Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`p-6 rounded-xl bg-white dark:bg-[#081326] flex flex-col gap-4 transition-colors border ${stat.glow}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-lightText-secondary dark:text-darkText-secondary uppercase tracking-wider">{stat.title}</span>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${stat.iconBg}`}>
                {stat.icon}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-[#0B1933] dark:text-[#F7F8FA] tracking-tight">{stat.value}</div>
              <div className="text-[11px] text-lightText-secondary dark:text-darkText-secondary font-semibold mt-1">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Two Columns (Logs & Action triggers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Recent Activities */}
        <div className="md:col-span-2 p-6 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] shadow-sm flex flex-col gap-6 transition-colors">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-[#0B1933] dark:text-[#F7F8FA] tracking-wider">Son Sistem Hareketleri (Log)</h3>
            <p className="text-[10px] text-lightText-secondary dark:text-darkText-secondary mt-0.5">Platform genelinde oluşan son 5 işlem kaydı.</p>
          </div>

          <div className="flex flex-col gap-4">
            {data?.logs && data.logs.length > 0 ? (
              data.logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-borderlight dark:border-dark-border bg-gray-50 dark:bg-[#0A111E] flex justify-between items-start gap-4 text-xs"
                >
                  <div className="flex gap-3">
                    <span className="text-[#0B1933] dark:text-white">⚡</span>
                    <span className="font-medium text-lightText-primary dark:text-darkText-primary">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-lightText-secondary dark:text-darkText-secondary whitespace-nowrap">
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
        <div className="p-6 rounded-xl border border-borderlight dark:border-dark-border bg-white dark:bg-[#081326] shadow-sm flex flex-col gap-6 transition-colors">
          <div>
            <h3 className="font-extrabold text-sm uppercase text-[#0B1933] dark:text-[#F7F8FA] tracking-wider">Hızlı İşlemler</h3>
            <p className="text-[10px] text-lightText-secondary dark:text-darkText-secondary mt-0.5">Platform operasyonel kontrolleri.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Direct Trigger to run billingCheck */}
            <form action="/api/admin/billing-check" method="POST" target="_blank" className="w-full">
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg border border-borderlight dark:border-dark-border bg-gray-100 dark:bg-[#0A111E] hover:bg-gray-200 dark:hover:bg-dark-highlight text-[#0B1933] dark:text-[#F7F8FA] font-bold text-xs tracking-wider uppercase transition-colors text-center block"
              >
                Fatura Downgrade Worker Çalıştır
              </button>
            </form>
            <p className="text-[10px] text-lightText-secondary dark:text-darkText-secondary leading-normal">
              Bu buton fatura tarihi geçen salonları otomatik Ücretsiz plana düşüren gecelik fatura kontrol servisini (worker) manuel olarak tetikler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
