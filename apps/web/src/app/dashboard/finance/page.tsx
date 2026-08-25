"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";

interface StaffReport {
  staffId: string;
  name: string;
  title: string;
  commissionRate: number;
  totalAppointments: number;
  totalRevenue: number;
  totalCommission: number;
}

interface Summary {
  totalCiro: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
  totalDistributedCommission: number;
}

export default function FinancePage() {
  const router = useRouter();

  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [report, setReport] = useState<StaffReport[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filters (defaults to current month)
  const getInitialDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    return { start, end };
  };

  const [startDate, setStartDate] = useState(() => getInitialDates().start);
  const [endDate, setEndDate] = useState(() => getInitialDates().end);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/finance");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  const fetchFinanceData = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      setLoading(true);
      setError(null);

      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("kuafor-token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE}/api/finance/staff-commissions?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            "x-tenant-slug": tenantSlug,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const json = await response.json();
      if (response.ok && json.success) {
        setReport(json.data.report || []);
        setSummary(json.data.summary || null);
      } else {
        setError(json.error?.message || "Finansal veriler çekilemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucu bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, startDate, endDate, API_BASE]);

  useEffect(() => {
    if (authReady && tenantSlug) {
      fetchFinanceData();
    }
  }, [authReady, tenantSlug, fetchFinanceData]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-neutral-900 dark:text-white">💰 KASA & PRİM RAPORU</h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
            Salon ciro özetini ve personel prim hakedişlerini detaylı inceleyin
          </p>
        </div>

        {/* Tarih Seçicileri */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <span className="text-neutral-400 dark:text-gray-500 text-xs">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 uppercase tracking-widest">Rapor Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Toplam Ciro */}
            <div className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm group hover:border-primary/20 transition-all">
              <div className="text-[10px] font-black uppercase text-neutral-500 dark:text-gray-400 tracking-wider">Top Ciro (Seçili Dönem)</div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
                {summary?.totalCiro?.toLocaleString("tr-TR") || 0} TL
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-gray-500 mt-1">Havale dahil toplam gelir</div>
              <span className="absolute top-4 right-4 text-xl opacity-20">💰</span>
            </div>

            {/* Nakit Kasa */}
            <div className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm group hover:border-primary/20 transition-all">
              <div className="text-[10px] font-black uppercase text-neutral-500 dark:text-gray-400 tracking-wider">Nakit Kasa</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {summary?.cashRevenue?.toLocaleString("tr-TR") || 0} TL
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-gray-500 mt-1">Nakit alınan ödemeler</div>
              <span className="absolute top-4 right-4 text-xl opacity-20">💵</span>
            </div>

            {/* Kredi Kartı Kasa */}
            <div className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm group hover:border-primary/20 transition-all">
              <div className="text-[10px] font-black uppercase text-neutral-500 dark:text-gray-400 tracking-wider">Kart Kasası</div>
              <div className="text-2xl font-black text-primary mt-2">
                {summary?.cardRevenue?.toLocaleString("tr-TR") || 0} TL
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-gray-500 mt-1">POS üzerinden tahsilatlar</div>
              <span className="absolute top-4 right-4 text-xl opacity-20">💳</span>
            </div>

            {/* Dağıtılacak Toplam Personel Primi */}
            <div className="bg-white dark:bg-[#121212]/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 shadow-sm group hover:border-primary/20 transition-all">
              <div className="text-[10px] font-black uppercase text-neutral-500 dark:text-gray-400 tracking-wider">Dağıtılacak Prim</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {summary?.totalDistributedCommission?.toLocaleString("tr-TR") || 0} TL
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-gray-500 mt-1">Personellere ödenecek pay</div>
              <span className="absolute top-4 right-4 text-xl opacity-20">👥</span>
            </div>
          </div>

          {/* Personel Hakediş Tablosu */}
          <div className="bg-white dark:bg-[#121212]/40 border border-neutral-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
            <h3 className="font-extrabold text-sm uppercase text-neutral-900 dark:text-white tracking-wider mb-4">
              👥 Personel Hakediş Detayları
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-white/5 text-[10px] uppercase text-neutral-500 dark:text-gray-400 tracking-wider">
                    <th className="pb-3 pl-2">Personel Adı</th>
                    <th className="pb-3">Unvan</th>
                    <th className="pb-3 text-center">Prim Oranı (%)</th>
                    <th className="pb-3 text-center">İşlem Sayısı</th>
                    <th className="pb-3 text-right">Ürettiği Ciro</th>
                    <th className="pb-3 text-right pr-2">Kazanılan Prim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/[0.04]">
                  {report.map((item) => (
                    <tr key={item.staffId} className="hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 pl-2 font-bold text-neutral-900 dark:text-white text-sm">{item.name}</td>
                      <td className="py-4 text-xs text-neutral-500 dark:text-gray-400">{item.title}</td>
                      <td className="py-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                          %{item.commissionRate}
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold text-sm text-neutral-800 dark:text-gray-300">
                        {item.totalAppointments}
                      </td>
                      <td className="py-4 text-right font-semibold text-neutral-800 dark:text-gray-300">
                        {item.totalRevenue.toLocaleString("tr-TR")} TL
                      </td>
                      <td className="py-4 text-right font-black text-emerald-600 dark:text-emerald-400 pr-2">
                        {item.totalCommission.toLocaleString("tr-TR")} TL
                      </td>
                    </tr>
                  ))}
                  {report.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-neutral-500 dark:text-gray-500">
                        Seçilen tarih aralığında tamamlanmış ve ödenmiş işlem bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
