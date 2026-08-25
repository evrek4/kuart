"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "./actions";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    getProfile().then(res => {
      if (res.success && res.data) {
        setName(res.data.name || "");
        setPhone(res.data.phone || "");
        setAddress(res.data.address || "");
        setEmail(res.data.email || "");
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("address", address);

    const res = await updateProfile(formData);
    if (res.success) {
      setMessage({ type: "success", text: res.message || "" });
    } else {
      setMessage({ type: "error", text: res.error || "Güncelleme başarısız." });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0D1B32] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profil Ayarları</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">E-Posta (Değiştirilemez)</label>
            <input
              type="text"
              disabled
              value={email}
              className="bg-gray-100 dark:bg-[#081326] border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">İsim Soyisim</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Telefon Numarası</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxxx"
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Açık Adres</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adres detayları"
              className="bg-white dark:bg-[#081326] border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
