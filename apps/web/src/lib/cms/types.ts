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
  // Logo & Visuals
  logoUrl: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  logoWidth: number;
  logoHeight: number;
  logoLink: string;
  // Social links
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
  borderRadius: string; // 'rounded-2xl', 'rounded-3xl', 'rounded-xl'
}

export interface MetricItem {
  value: string;
  label: string;
  highlight?: boolean;
  color?: string; // 'purple', 'emerald', 'amber', 'indigo'
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  bulletPoints: string[];
  color: string; // 'emerald', 'purple', 'amber', 'indigo'
}

export interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
  icon?: string;
  color: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  salon: string;
  image?: string;
  comment: string;
  rating: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
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

export interface LandingSection {
  id: string; // 'hero' | 'metrics' | 'benefits' | 'how-it-works' | 'pricing' | 'testimonials' | 'faq' | 'cta-banner'
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
