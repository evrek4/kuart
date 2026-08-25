"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentTenantInfo } from "@/lib/auth";

interface MediaItem {
  id: string;
  url: string;
  name: string;
  fileSize: number;
}

export default function GalleryPage() {
  const router = useRouter();

  // Tenant bilgisi JWT'den okunur
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [capacity, setCapacity] = useState({
    usedBytes: 0,
    maxCapacity: 104857600, // 100MB Default
    availableBytes: 104857600,
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Broken image states
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
  const placeholderImg = "https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=300&auto=format&fit=crop";

  // JWT'den tenant bilgisi al
  useEffect(() => {
    const info = getCurrentTenantInfo();
    if (!info || !info.tenantId) {
      router.replace("/login?callbackUrl=/dashboard/gallery");
      return;
    }
    setTenantSlug(info.tenantSlug);
    setAuthReady(true);
  }, [router]);

  const fetchGalleryData = useCallback(async () => {
    if (!tenantSlug) return;
    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const response = await fetch(`${API_BASE}/api/gallery`, {
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setGallery(json.data.gallery || []);
        setCapacity(json.data.capacity);
      }
    } catch (err) {
      console.error("Fetch gallery error:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug, API_BASE]);

  useEffect(() => {
    if (authReady && tenantSlug) fetchGalleryData();
  }, [authReady, tenantSlug, fetchGalleryData]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
      } else {
        alert("Lütfen sadece resim dosyası seçiniz (JPEG, PNG, WEBP).");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const response = await fetch(`${API_BASE}/api/gallery`, {
        method: "POST",
        headers: {
          "x-tenant-slug": tenantSlug!,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setSuccessMessage("Görsel başarıyla galeriye yüklendi.");
        setTimeout(() => setSuccessMessage(null), 3000);
        setSelectedFile(null);
        fetchGalleryData();
      } else {
        alert(json.error?.message || "Fotoğraf yüklenemedi. Kota dolmuş olabilir.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Fotoğraf yüklenirken bağlantı hatası oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Bu görseli silmek istediğinizden emin misiniz?") || !tenantSlug) return;

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
        method: "DELETE",
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setSuccessMessage("Görsel silindi ve depolama alanınız boşaltıldı.");
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchGalleryData();
      } else {
        alert(json.error?.message || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Delete media error:", err);
      alert("Silme hatası oluştu.");
    }
  };

  const handleSetCover = async (id: string) => {
    if (!tenantSlug) return;

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("kuafor-token="))?.split("=")[1];
      const response = await fetch(`${API_BASE}/api/gallery/${id}/cover`, {
        method: "POST",
        headers: {
          "x-tenant-slug": tenantSlug,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setSuccessMessage("Görsel başarıyla salon kapak fotoğrafı yapıldı!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(json.error?.message || "Kapak resmi ayarlanamadı.");
      }
    } catch (err) {
      console.error("Set cover image error:", err);
      alert("Kapak resmi değiştirme hatası.");
    }
  };

  const formatMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const percentUsed = capacity.maxCapacity > 0
    ? Math.min(100, (capacity.usedBytes / capacity.maxCapacity) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide text-neutral-900 dark:text-white">🖼️ MEDYA GALERİSİ</h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Salonunuza ait saç stillerini ve vitrin fotoğraflarını yönetin</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-neutral-600 dark:text-gray-400 font-bold">
            {formatMB(capacity.usedBytes)} / {formatMB(capacity.maxCapacity)} Depolama Alanı
          </span>
          <div className="w-full sm:w-48 h-2 bg-neutral-200 dark:bg-white/5 rounded-full overflow-hidden border border-neutral-200 dark:border-white/5">
            <div className="h-full bg-primary rounded-full shadow-sm dark:shadow-gold-glow" style={{ width: `${percentUsed}%` }} />
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 p-4 rounded-xl text-xs font-bold shadow-sm dark:shadow-gold-glow">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Box (Drag & Drop) */}
        <div className="glass-card p-6 flex flex-col gap-4 self-start">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Fotoğraf Yükle</h3>
            <p className="text-[10px] text-neutral-500 dark:text-gray-400 mt-0.5">Maksimum 5MB boyutunda JPEG, PNG, WEBP dosyaları</p>
          </div>

          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
            {/* Drag Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[150px] relative ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : selectedFile
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-neutral-300 dark:border-white/10 hover:border-primary/40 bg-neutral-50 dark:bg-transparent"
              }`}
              onClick={() => document.getElementById("file-picker")?.click()}
            >
              <input
                type="file"
                id="file-picker"
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <>
                  <span className="text-2xl">📄</span>
                  <div className="text-xs text-neutral-900 dark:text-white font-bold truncate max-w-[200px]">
                    {selectedFile.name}
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl text-primary/80">📥</span>
                  <span className="text-xs text-neutral-600 dark:text-gray-400">
                    Dosyayı buraya sürükleyin veya <strong className="text-primary hover:underline">seçin</strong>
                  </span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className={`w-full py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm mt-2 flex items-center justify-center gap-2 ${
                !selectedFile ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Sisteme Yükle"
              )}
            </button>
          </form>
        </div>

        {/* Gallery Display Grid */}
        <div className="md:col-span-2 glass-card p-6 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Fotoğraflarınız</h3>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <span className="w-6 h-6 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">Yükleniyor...</span>
            </div>
          ) : gallery.length === 0 ? (
            <p className="text-xs text-neutral-500 dark:text-gray-400 py-20 text-center">
              Henüz fotoğraf yüklenmedi. Sürükleyip bırakarak ilk fotoğrafı ekleyin!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {gallery.map(item => {
                  const isBroken = brokenImages[item.id] || false;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className="flex flex-col gap-2 group relative border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-2 rounded-2xl overflow-hidden shadow-sm"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-200 dark:bg-black/40">
                        <Image
                          src={isBroken ? placeholderImg : item.url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 250px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => {
                            setBrokenImages(prev => ({ ...prev, [item.id]: true }));
                          }}
                        />

                        {/* Hover Actions Menu */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-3">
                          <button
                            type="button"
                            onClick={() => handleSetCover(item.id)}
                            className="w-full py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 font-extrabold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                          >
                            🖼️ Kapak Yap
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col text-center mt-1">
                        <span className="text-[11px] font-bold text-neutral-900 dark:text-white truncate px-1" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 dark:text-gray-400 mt-0.5">{formatMB(item.fileSize)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
