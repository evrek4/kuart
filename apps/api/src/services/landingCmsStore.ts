// Landing Page CMS in-memory service & store

export interface CtaButton {
  text: string;
  url: string;
  isExternal?: boolean;
  openNewTab?: boolean;
  isActive: boolean;
  icon?: string;
}

export interface BrandSettings {
  brandName: string;
  shortBrandName: string;
  slogan: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  logoWidth: number;
  logoHeight: number;
  logoLink: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface ThemeSettings {
  primaryGradientStart: string;
  primaryGradientEnd: string;
  accentColor: string;
  borderRadius: string;
}

export interface LandingSection {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  primaryCta?: CtaButton;
  secondaryCta?: CtaButton;
  items?: any[];
}

export interface PricingFeature {
  name: string;
  isIncluded: boolean;
  icon?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discountText?: string;
  currency: string;
  description: string;
  isPopular: boolean;
  isVip: boolean;
  isActive: boolean;
  ctaText: string;
  ctaUrl: string;
  features: PricingFeature[];
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  altText: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface LandingCmsPayload {
  version: string;
  publishedAt: string;
  brand: BrandSettings;
  seo: SeoSettings;
  theme: ThemeSettings;
  sections: LandingSection[];
  pricingTiers: PricingTier[];
}

const initialPayload: LandingCmsPayload = {
  version: '2.0.0',
  publishedAt: new Date().toISOString(),
  brand: {
    brandName: 'Kuaför.art',
    shortBrandName: 'Kuaför.art',
    slogan: 'Kuaför ve Güzellik Salonları İçin Yeni Nesil Yönetim Platformu',
    description: 'Randevularınızı otomatikleştirin, gelmeyen müşterileri (no-show) sıfırlayın ve cironuzu artırın. Kuaför ve güzellik salonları için yapay zeka destekli hepsi bir arada yönetim platformu.',
    email: 'destek@kuafor.art',
    phone: '+90 (850) 885 00 00',
    address: 'Büyükdere Cad. No:199 Levent, Beşiktaş / İstanbul',
    logoUrl: '',
    logoDarkUrl: '',
    logoLightUrl: '',
    mobileLogoUrl: '',
    faviconUrl: '',
    logoWidth: 160,
    logoHeight: 40,
    logoLink: '/',
    instagram: 'https://instagram.com/kuafor.art',
    facebook: 'https://facebook.com/kuafor.art',
    x: 'https://x.com/kuaforart',
    youtube: 'https://youtube.com/@kuaforart',
    linkedin: 'https://linkedin.com/company/kuaforart',
    whatsapp: 'https://wa.me/908508850000'
  },
  seo: {
    metaTitle: 'Kuaför.art | Salon Yönetiminde Yeni Nesil Akıllı Platform',
    metaDescription: 'Kuaför ve güzellik salonları için randevu takvimi, no-show engelleyici WhatsApp asistanı, personel prim takibi ve online vitrin platformu.',
    keywords: 'kuaför randevu programı, güzellik merkezi yazılımı, salon otomasyonu, no-show engelleme, kuaför adisyon',
    ogTitle: 'Kuaför.art | Salonunuzu Yönetmenin En Akıllı ve Prestijli Yolu',
    ogDescription: 'Randevuları otomatikleştirin, ciroyu artırın ve prestijli online vitrininize hemen sahip olun.',
    canonicalUrl: 'https://kuafor.art',
    robots: 'index, follow'
  },
  theme: {
    primaryGradientStart: '#9333ea',
    primaryGradientEnd: '#4f46e5',
    accentColor: '#f59e0b',
    borderRadius: 'rounded-3xl'
  },
  sections: [
    {
      id: 'hero',
      name: 'Hero Giriş Alanı',
      isActive: true,
      order: 1,
      badge: '✨ Kuaför ve Güzellik Salonları İçin Yeni Nesil Yönetim Platformu',
      title: 'Salonunuzu Yönetmenin En Akıllı ve Prestijli Yolu',
      subtitle: 'Randevularınızı otomatikleştirin, gelmeyen müşterileri (no-show) sıfırlayın ve cironuzu artırın. Kuaför ve güzellik salonları için yapay zeka destekli hepsi bir arada yönetim platformu.',
      imageUrl: '',
      primaryCta: {
        text: 'Hemen Ücretsiz Başla',
        url: '/register',
        isExternal: false,
        openNewTab: false,
        isActive: true,
        icon: 'ArrowRight'
      },
      secondaryCta: {
        text: 'Paketleri İncele',
        url: '#pricing',
        isExternal: false,
        openNewTab: false,
        isActive: true,
        icon: 'Sparkles'
      }
    },
    {
      id: 'metrics',
      name: 'Rakamlarla Güven (Social Proof)',
      isActive: true,
      order: 2,
      items: [
        { value: '500+', label: 'Aktif Kuaför & Salon', color: 'purple' },
        { value: '50.000+', label: 'Tamamlanan Randevu', color: 'white' },
        { value: '%0', label: 'No-Show Oranı (WhatsApp ile)', color: 'emerald' },
        { value: '%99.8', label: 'Kuaför Memnuniyet Skoru', color: 'amber' }
      ]
    },
    {
      id: 'benefits',
      name: 'Kuaföre Ne Kazandıracak (Özellikler)',
      isActive: true,
      order: 3,
      badge: 'KUAFÖRE NE KAZANDIRACAK?',
      title: 'Salonunuzun Sorunlarına Nokta Atışı Çözümler',
      subtitle: 'Teknik karmaşayı bir kenara bırakın. Kuaför.art, her gün karşılaştığınız en büyük operasyonel zorlukları kökünden çözer.',
      items: [
        {
          id: 'b-1',
          title: 'No-Show\'a Son (Akıllı WhatsApp Asistanı)',
          description: 'Müşterilerinize randevudan önce otomatik hatırlatma gider. "Geleceğim" veya "Gelmeyeceğim" yanıtlarına göre takviminiz otomatik güncellenir, boş koltuk derdiniz biter.',
          badge: '0 Boş Koltuk',
          icon: 'Smartphone',
          color: 'emerald',
          bulletPoints: [
            '2 yönlü otomatik onay ve iptal algılama',
            'İptal olan koltuğu anında yedek müşteriye önerme'
          ]
        },
        {
          id: 'b-2',
          title: 'Sadık Müşteriler (Otomatik Pazarlama)',
          description: '35 gündür gelmeyen müşterilerinize "Özlettiniz" mesajı atar, doğum günlerinde otomatik indirim sunar ve dijital damga kartı ile sürekli size gelmelerini sağlar.',
          badge: 'Otomatik Ciro Büyümesi',
          icon: 'Gift',
          color: 'purple',
          bulletPoints: [
            'Doğum günlerine özel kişiselleştirilmiş kupon hediyesi',
            'Kayıp müşterileri geri getiren yapay zeka tetikleyicisi'
          ]
        },
        {
          id: 'b-3',
          title: 'Kasa ve Personel Yönetimi',
          description: 'Randevu bitiminde tek tıkla adisyon kapatın, nakit/kart kasanızı tutun ve personellerinizin prim hak edişlerini ay sonunda otomatik hesaplayın.',
          badge: 'Şeffaf Muhasebe',
          icon: 'CreditCard',
          color: 'amber',
          bulletPoints: [
            'Usta & çalışan bazlı otomatik prim ve ciro raporu',
            'Gün sonu tek tıkla net kasa dökümü ve PDF fiş üretimi'
          ]
        },
        {
          id: 'b-4',
          title: 'Prestijli Online Vitrin',
          description: 'Kendi alan adınızla (örn: salonadi.com), 7/24 randevu alabileceğiniz premium temalı bir web sitesine dakikalar içinde sahip olun.',
          badge: '7/24 Kesintisiz Randevu',
          icon: 'Globe',
          color: 'indigo',
          bulletPoints: [
            'Luxury Gold ve Modern Dark vitrin temaları',
            'Instagram profilinizden tek tıkla randevu alma linki'
          ]
        }
      ]
    },
    {
      id: 'how-it-works',
      name: 'Nasıl Çalışır (3 Adım)',
      isActive: true,
      order: 4,
      badge: 'KOLAY VE HIZLI KURULUM',
      title: '3 Adımda Salonunuzu Dijitalleştirin',
      items: [
        {
          stepNumber: 1,
          title: 'Salon Hesabınızı Açın',
          description: '2 dakikada salon adı ve yetkili iletişim bilgilerinizle ücretsiz kaydınızı tamamlayın.',
          color: 'purple'
        },
        {
          stepNumber: 2,
          title: 'Hizmet & Ekibinizi Tanımlayın',
          description: 'Saç kesimi, renklendirme vb. hizmetlerinizi fiyatlarıyla ekleyin ve ustalarınızı tanımlayın.',
          color: 'indigo'
        },
        {
          stepNumber: 3,
          title: 'Otomasyonun Keyfini Çıkarın',
          description: 'Randevularınız otomatik aksın, WhatsApp teyitleri gitsin ve kasanız hiç olmadığı kadar büyüsün.',
          color: 'amber'
        }
      ]
    },
    {
      id: 'pricing',
      name: 'Fiyatlandırma Bölümü',
      isActive: true,
      order: 5,
      badge: 'ŞEFFAF VE ESNEK FİYATLAR',
      title: 'Her Boyuttaki Salon İçin Uygun Paketler',
      subtitle: 'İhtiyacınıza en uygun paketi seçin. Kredi kartı olmadan ücretsiz başlayabilir, dilediğinizde yükseltebilirsiniz.'
    },
    {
      id: 'testimonials',
      name: 'Müşteri Yorumları (Testimonials)',
      isActive: true,
      order: 6,
      badge: 'GÜVENEN SALONLAR',
      title: 'Kuaförler Ne Diyor?',
      items: [
        {
          id: 't-1',
          name: 'Ahmet Kaya',
          role: 'Kurucu & Baş Stilist',
          salon: 'Nişantaşı Hair Studio',
          comment: 'No-show oranımız %22\'den sıfıra indi! WhatsApp asistanı tek başına salonun aylık cirosuna en az 40.000 TL katkı sağlıyor. Randevu çakışması veya unutulan müşteri derdimiz bitti.',
          rating: 5
        },
        {
          id: 't-2',
          name: 'Selin Demir',
          role: 'Salon Sahibi',
          salon: 'Levent Beauty & Spa Lounge',
          comment: 'Personel primlerini hesaplamak her ay sonu 2 günümü alıyordu. Kuaför.art ile tek tıkla kim ne kadar ciro yapmış ve prim kazanmış döküm alıyorum. İnanılmaz bir rahatlık!',
          rating: 5
        },
        {
          id: 't-3',
          name: 'Caner Yılmaz',
          role: 'Master Barber',
          salon: 'Moda Men\'s Club',
          comment: 'Müşterilerim gece 01:00\'de bile sitemizden randevu oluşturuyor. Sabah uyandığımda günün tüm saatlerinin dolduğunu görmek harika. Prestijli vitrin temaları da müşterilerimi çok etkiledi.',
          rating: 5
        }
      ]
    },
    {
      id: 'faq',
      name: 'Sıkça Sorulan Sorular (FAQ)',
      isActive: true,
      order: 7,
      badge: 'SIKÇA SORULAN SORULAR',
      title: 'Aklınıza Takılan Her Şey',
      items: [
        {
          id: 'f-1',
          question: 'Kullanmaya başlamak için teknik veya yazılım bilgisi gerekiyor mu?',
          answer: 'Kesinlikle hayır! Kuaför.art, hiçbir teknik bilgiye ihtiyaç duymadan dakikalar içinde kullanabileceğiniz şekilde tasarlandı. Salon adınızı, hizmetlerinizi ve çalışanlarınızı eklemeniz yeterlidir. Sisteme kayıt olmak yalnızca 2 dakikanızı alır.',
          isActive: true
        },
        {
          id: 'f-2',
          question: 'WhatsApp otomatik randevu onay mekanizması nasıl çalışır?',
          answer: 'Müşteriniz randevu aldığında veya randevu saatinden önce (örneğin 3 saat kala) sistem müşterinize otomatik bir WhatsApp onay mesajı gönderir. Müşteri "Geleceğim" veya "İptal" butonuna bastığında takviminiz otomatik güncellenir. Böylece boş koltuk ve no-show derdiniz tamamen biter.',
          isActive: true
        },
        {
          id: 'f-3',
          question: 'Kendi özel alan adımı (örn: salonadi.com) bağlayabilir miyim?',
          answer: 'Evet! Elite paketimizde salonunuzun kendi alan adını (www.salonunuz.com) sisteme tek tıkla bağlayabilirsiniz. Müşterileriniz doğrudan kendi markanızın adresinden 7/24 randevu oluşturabilir.',
          isActive: true
        },
        {
          id: 'f-4',
          question: 'Personel prim ve adisyon takibi nasıl yapılıyor?',
          answer: 'Hizmet tamamlandığında tek tıkla adisyonu kapatabilir, ödemeyi nakit veya kart olarak kaydedebilirsiniz. Sistemde tanımladığınız personel prim oranlarına (%20, %30 vb.) göre ay sonunda her ustanın ve asistanın hak edişi kuruşu kuruşuna otomatik hesaplanır.',
          isActive: true
        },
        {
          id: 'f-5',
          question: 'İstediğim zaman paket değiştirebilir veya iptal edebilir miyim?',
          answer: 'Evet, hiçbir taahhüt veya sözleşme zorunluluğu yoktur. İstediğiniz an paketinizi yükseltebilir, düşürebilir veya tek tıkla aboneliğinizi sonlandırabilirsiniz.',
          isActive: true
        }
      ]
    },
    {
      id: 'cta-banner',
      name: 'Final Eyleme Çağrı (CTA Banner)',
      isActive: true,
      order: 8,
      title: 'Salonunuzu Geleceğe Taşımaya Hazır Mısınız?',
      subtitle: 'Hemen bugün ücretsiz kaydolun, ilk randevularınızı dakikalar içinde almaya başlayın. Kredi kartı gerekmez.',
      primaryCta: {
        text: 'Hemen Ücretsiz Hesabınızı Açın',
        url: '/register',
        isExternal: false,
        openNewTab: false,
        isActive: true,
        icon: 'ArrowRight'
      }
    }
  ],
  pricingTiers: [
    {
      id: 'tier-free',
      name: 'BAŞLANGIÇ',
      badge: 'Ücretsiz',
      monthlyPrice: 0,
      yearlyPrice: 0,
      discountText: '',
      currency: '₺',
      description: 'Yeni başlayan ve temel ajanda arayan salonlar için.',
      isPopular: false,
      isVip: false,
      isActive: true,
      ctaText: 'Ücretsiz Başla',
      ctaUrl: '/register?plan=FREE',
      features: [
        { name: 'Temel Randevu Takvimi', isIncluded: true },
        { name: 'Müşteri Kayıt Defteri', isIncluded: true },
        { name: 'Standart Web Vitrini (kuafor.art/salon)', isIncluded: true },
        { name: 'Manuel Kasa & Adisyon Takibi', isIncluded: true },
        { name: '1 Personel Tanımlama', isIncluded: true },
        { name: '100 MB Medya Depolama', isIncluded: true }
      ]
    },
    {
      id: 'tier-pro',
      name: 'PRO',
      badge: '🔥 EN ÇOK TERCİH EDİLEN',
      monthlyPrice: 499,
      yearlyPrice: 399,
      discountText: '%20 İndirim',
      currency: '₺',
      description: 'İşini büyütmek, personellerini yönetmek ve otomatikleştirmek isteyenler için.',
      isPopular: true,
      isVip: false,
      isActive: true,
      ctaText: 'Pro Paketi Seçin',
      ctaUrl: '/register?plan=PRO',
      features: [
        { name: 'Başlangıç paketindeki her şey dahil', isIncluded: true },
        { name: 'WhatsApp Otomatik Hatırlatıcı', isIncluded: true },
        { name: 'Dijital Sadakat & Damga Sistemi', isIncluded: true },
        { name: 'Personel Prim & Hak Ediş Modülü', isIncluded: true },
        { name: 'Premium Portal & Dark Temalar', isIncluded: true },
        { name: 'Sınırsız Personel Ekleme', isIncluded: true },
        { name: '500 MB Medya Depolama Alanı', isIncluded: true },
        { name: 'Öncelikli WhatsApp Desteği', isIncluded: true }
      ]
    },
    {
      id: 'tier-elite',
      name: 'ELITE',
      badge: '👑 VIP & PRESTİJ',
      monthlyPrice: 999,
      yearlyPrice: 799,
      discountText: '%20 İndirim',
      currency: '₺',
      description: 'Sınırları kaldırmak ve markasını büyütmek isteyen prestijli salonlar için.',
      isPopular: false,
      isVip: true,
      isActive: true,
      ctaText: 'Elite VIP Pakete Geç',
      ctaUrl: '/register?plan=ELITE',
      features: [
        { name: 'Pro paketindeki tüm özellikler dahil', isIncluded: true },
        { name: 'Özel Alan Adı (salonadi.com)', isIncluded: true },
        { name: 'Kendi Sanal POS\'unu Bağlama', isIncluded: true },
        { name: 'Sınırsız Bildirim & Pazarlama', isIncluded: true },
        { name: 'Gelişmiş PDF Raporlama & Muhasebe', isIncluded: true },
        { name: 'İndirim Kupon & Promosyon Motoru', isIncluded: true },
        { name: '10 GB Yüksek Hızlı Bulut Depolama', isIncluded: true },
        { name: '7/24 Birebir VIP Özel Danışman', isIncluded: true }
      ]
    }
  ]
};

// In-Memory Storage
let publishedPayload: LandingCmsPayload = JSON.parse(JSON.stringify(initialPayload));
let draftPayload: LandingCmsPayload = JSON.parse(JSON.stringify(initialPayload));

let mediaAssets: MediaAsset[] = [
  {
    id: 'media-1',
    filename: 'kuafor-art-logo.png',
    url: '/default-logo.png',
    fileSize: 45200,
    mimeType: 'image/png',
    altText: 'Kuaför.art Ana Logo',
    createdAt: new Date().toISOString()
  },
  {
    id: 'media-2',
    filename: 'hero-salon-preview.png',
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
    fileSize: 245000,
    mimeType: 'image/jpeg',
    altText: 'Salon Hero Önizleme Görseli',
    createdAt: new Date().toISOString()
  }
];

let auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user: 'admin@kuafor.art',
    action: 'Landing Page CMS v.2 Başlatıldı',
    timestamp: new Date().toISOString(),
    details: 'Varsayılan içerik şablonu yüklendi.'
  }
];

export const landingCmsStore = {
  getPublishedPayload: () => publishedPayload,
  getDraftPayload: () => draftPayload,
  updateDraftPayload: (data: Partial<LandingCmsPayload>) => {
    draftPayload = {
      ...draftPayload,
      ...data,
      brand: { ...draftPayload.brand, ...(data.brand || {}) },
      seo: { ...draftPayload.seo, ...(data.seo || {}) },
      theme: { ...draftPayload.theme, ...(data.theme || {}) },
      sections: data.sections || draftPayload.sections,
      pricingTiers: data.pricingTiers || draftPayload.pricingTiers
    };
    return draftPayload;
  },
  publishDraftPayload: (user: string = 'Super Admin') => {
    publishedPayload = JSON.parse(JSON.stringify(draftPayload));
    publishedPayload.publishedAt = new Date().toISOString();
    
    auditLogs.unshift({
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      user,
      action: 'Canlı Sayfa Yayınlandı (Publish)',
      timestamp: new Date().toISOString(),
      details: `Versiyon ${publishedPayload.version} canlıya alındı.`
    });
    
    return publishedPayload;
  },
  getMediaAssets: () => mediaAssets,
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => {
    const newAsset: MediaAsset = {
      id: `media-${Math.random().toString(36).substr(2, 9)}`,
      ...asset,
      createdAt: new Date().toISOString()
    };
    mediaAssets.unshift(newAsset);
    return newAsset;
  },
  deleteMediaAsset: (id: string) => {
    const index = mediaAssets.findIndex(m => m.id === id);
    if (index !== -1) {
      mediaAssets.splice(index, 1);
      return true;
    }
    return false;
  },
  getAuditLogs: () => auditLogs,
  addAuditLog: (user: string, action: string, details?: string) => {
    auditLogs.unshift({
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      user,
      action,
      timestamp: new Date().toISOString(),
      details
    });
  }
};
