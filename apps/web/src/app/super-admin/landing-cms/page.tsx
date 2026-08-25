'use client';

import React, { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'hero', name: 'Giriş Alanı (Hero)' },
  { id: 'timeline', name: 'Akış (Timeline)' },
  { id: 'chat', name: 'WhatsApp & No-Show' },
  { id: 'loyalty', name: 'Sadakat Sistemi' },
  { id: 'finance', name: 'Finans & Kasa' },
  { id: 'storefront', name: 'Online Vitrin' },
  { id: 'pricing', name: 'Fiyatlandırma' }
];

export default function LandingCmsPage() {
  const [draft, setDraft] = useState<any>({
    heroTitle: 'Apple Kalitesinde Salon Yönetimi',
    heroDescription: 'Randevulardan kasaya kadar tüm operasyonunuz için tek sistem.',
    ctaText: 'Ücretsiz Dene',
    ctaLink: '/register',
    isPublished: false,
    activeSections: { hero: true, timeline: true, chat: true, loyalty: true, finance: true, storefront: true, pricing: true },
    seoTitle: '', seoDescription: '', logoLight: '', logoDark: '', favicon: ''
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/landing/draft')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const config = data.data;
          if (typeof config.activeSections === 'string') {
            try { config.activeSections = JSON.parse(config.activeSections); } catch(e){}
          }
          if (!config.activeSections || Object.keys(config.activeSections).length === 0) {
            config.activeSections = { hero: true, timeline: true, chat: true, loyalty: true, finance: true, storefront: true, pricing: true };
          }
          setDraft(config);
        } else {
          setDraft({
            heroTitle: 'Apple Kalitesinde Salon Yönetimi',
            heroDescription: 'Randevulardan kasaya kadar tüm operasyonunuz için tek sistem.',
            ctaText: 'Ücretsiz Dene',
            ctaLink: '/register',
            isPublished: false,
            activeSections: { hero: true, timeline: true, chat: true, loyalty: true, finance: true, storefront: true, pricing: true },
            seoTitle: '', seoDescription: '', logoLight: '', logoDark: '', favicon: ''
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching CMS draft:', err);
        setDraft({
          heroTitle: 'Apple Kalitesinde Salon Yönetimi',
          heroDescription: 'Randevulardan kasaya kadar tüm operasyonunuz için tek sistem.',
          ctaText: 'Ücretsiz Dene',
          ctaLink: '/register',
          isPublished: false,
          activeSections: { hero: true, timeline: true, chat: true, loyalty: true, finance: true, storefront: true, pricing: true },
          seoTitle: '', seoDescription: '', logoLight: '', logoDark: '', favicon: ''
        });
        setLoading(false);
      });
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/landing/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.success) {
        setDraft({ ...draft, isPublished: false });
        showToast('Taslak başarıyla kaydedildi.');
      } else {
        showToast(data.error?.message || 'Kaydedilemedi.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Kayıt sırasında bir hata oluştu.', 'error');
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/landing/publish', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setDraft({ ...draft, isPublished: true });
        showToast('🚀 Başarıyla canlıya yayınlandı!');
      } else {
        showToast(data.error?.message || 'Yayınlanamadı.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Yayınlama sırasında bir hata oluştu.', 'error');
    }
  };

  const toggleSection = (sectionId: string) => {
    const activeSections = { ...draft.activeSections };
    activeSections[sectionId] = !activeSections[sectionId];
    setDraft({ ...draft, activeSections });
  };

  if (loading) {
    return <div className="p-8 text-gray-500 text-center font-bold">CMS Yükleniyor...</div>;
  }

  // Removed blocking error view as per instructions

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 dark:text-white p-4 md:p-8 transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderlight dark:border-dark-border pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0B1933] dark:text-[#F7F8FA]">Landing Page Yönetimi (Süper Admin)</h1>
            <p className="text-lightText-secondary dark:text-darkText-secondary mt-2 text-sm">Tasarım, SEO ve Seksiyon görünürlüklerini yönetin.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              draft.isPublished ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
            }`}>
              {draft.isPublished ? 'Yayında' : 'Yayınlanmamış Taslak'}
            </span>
            <button onClick={handleSave} className="bg-gray-50 dark:bg-[#0A111E] hover:bg-gray-100 dark:hover:bg-[#152033] text-lightText-primary dark:text-darkText-primary border border-borderlight dark:border-dark-border px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              Taslağı Kaydet
            </button>
            <button onClick={handlePublish} className="bg-[#0B1933] dark:bg-white hover:opacity-90 text-white dark:text-[#0B1933] px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-opacity">
              Canlıya Yayınla
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#081326] border border-borderlight dark:border-dark-border p-6 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#0B1933] dark:text-[#F7F8FA]">Giriş Alanı (Hero)</h2>
              <div>
                <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Hero Başlığı</label>
                <input 
                  type="text"
                  value={draft.heroTitle || ''}
                  onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
                  className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Hero Açıklaması</label>
                <textarea 
                  value={draft.heroDescription || ''}
                  onChange={(e) => setDraft({ ...draft, heroDescription: e.target.value })}
                  className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 h-24 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Buton Metni (CTA)</label>
                  <input 
                    type="text"
                    value={draft.ctaText || ''}
                    onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Buton Yönlendirmesi</label>
                  <input 
                    type="text"
                    value={draft.ctaLink || ''}
                    onChange={(e) => setDraft({ ...draft, ctaLink: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#081326] border border-borderlight dark:border-dark-border p-6 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#0B1933] dark:text-[#F7F8FA]">Markalama</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Aydınlık Logo URL</label>
                  <input 
                    type="text"
                    value={draft.logoLight || ''}
                    onChange={(e) => setDraft({ ...draft, logoLight: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Karanlık Logo URL</label>
                  <input 
                    type="text"
                    value={draft.logoDark || ''}
                    onChange={(e) => setDraft({ ...draft, logoDark: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">Favicon URL</label>
                <input 
                  type="text"
                  value={draft.favicon || ''}
                  onChange={(e) => setDraft({ ...draft, favicon: e.target.value })}
                  className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Sections & SEO */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#081326] border border-borderlight dark:border-dark-border p-6 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#0B1933] dark:text-[#F7F8FA]">Aktif Sayfa Bölümleri</h2>
              <div className="space-y-3">
                {SECTIONS.map((sec) => (
                  <label key={sec.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0A111E] border border-borderlight dark:border-dark-border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#152033] transition-colors">
                    <span className="text-sm font-medium text-lightText-primary dark:text-darkText-primary">{sec.name}</span>
                    <input 
                      type="checkbox"
                      checked={!!draft.activeSections[sec.id]}
                      onChange={() => toggleSection(sec.id)}
                      className="w-4 h-4 rounded text-[#0B1933] dark:text-white focus:ring-0 bg-white dark:bg-white/5 border-borderlight dark:border-dark-border accent-[#0B1933] dark:accent-white"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#081326] border border-borderlight dark:border-dark-border p-6 rounded-xl space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-[#0B1933] dark:text-[#F7F8FA]">SEO & Metadata</h2>
              <div>
                <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">SEO Sayfa Başlığı</label>
                <input 
                  type="text"
                  value={draft.seoTitle || ''}
                  onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })}
                  className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-lightText-secondary dark:text-darkText-secondary mb-1">SEO Sayfa Açıklaması</label>
                <textarea 
                  value={draft.seoDescription || ''}
                  onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })}
                  className="w-full bg-white dark:bg-white/5 border border-borderlight dark:border-dark-border rounded-lg p-3 text-sm text-lightText-primary dark:text-darkText-primary placeholder-gray-400 dark:placeholder-gray-500 h-20 focus:outline-none focus:border-[#0B1933] dark:focus:border-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
