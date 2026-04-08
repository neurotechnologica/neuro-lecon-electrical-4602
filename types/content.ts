export interface MetaContent {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  tradeType: string; // e.g. "plumber", "electrician"
}

export interface BrandingContent {
  trade: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  ownerName: string | null;
  ownerPhotoUrl: string | null;
  ownerStory: string | null;
}

export interface HeaderContent {
  logoUrl: string;
  navLinks: { label: string; href: string }[];
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  phoneCtaText: string;
}

export interface EmergencyBannerContent {
  enabled: boolean;
  message: string;
}

export interface ReviewItem {
  name: string;
  rating: number; // 1–5
  text: string;
  date: string; // ISO 8601 date string
}

export interface ReviewsContent {
  aggregateRating: number;
  totalCount: number;
  items: ReviewItem[];
}

export interface ServiceItem {
  name: string;
  description: string;
  icon: string;
  priceIndicator?: string;
  ctaText: string;
}

export interface DifferentiatorsContent {
  heading: string;
  subheading: string;
  items: { icon: string; title: string; description: string }[];
}

export interface AboutContent {
  story: string;
  teamImage: string;
  yearsInBusiness: number;
  certifications: string[];
  ctaText: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  isPlaceholder: boolean;
}

export interface ServiceAreaContent {
  heading: string;
  description: string;
  center: { lat: number; lng: number };
  zoom: number;
  polygon: { lat: number; lng: number }[];
  locations: {
    name: string;
    slug: string;
    description: string;
    coords: { lat: number; lng: number };
  }[];
}

export interface BookingContent {
  heading: string;
  fields: {
    name: string;
    phone: string;
    email: string;
    service: string;
    preferredDate: string;
    message: string;
  };
  submitText: string;
  confirmationMessage: string;
  errorMessage: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MaintenancePlansContent {
  enabled: boolean;
  heading: string;
  plans: {
    name: string;
    price: string;
    billingPeriod: string;
    features: string[];
    ctaText: string;
  }[];
}

export interface ChatContent {
  greeting: string;
  fallbackMessage: string;
}

export interface BlogContent {
  heading: string;
  postsPerPage: number;
  posts: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    metaDescription: string;
    body: string; // raw markdown string
  }[];
}

export interface AdminPanelContent {
  heading: string;
}

export interface SeoContent {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
  siteUrl: string;
  localBusiness: {
    name: string;
    type: string; // Schema.org type e.g. "Plumber"
    telephone: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    geo: { latitude: number; longitude: number };
    openingHours: string[];
  };
}

export interface ContentSchema {
  meta: MetaContent;
  branding: BrandingContent;
  header: HeaderContent;
  hero: HeroContent;
  emergencyBanner: EmergencyBannerContent;
  reviews: ReviewsContent;
  services: ServiceItem[];
  differentiators: DifferentiatorsContent;
  about: AboutContent;
  gallery: GalleryItem[];
  serviceArea: ServiceAreaContent;
  booking: BookingContent;
  faq: FaqItem[];
  maintenancePlans: MaintenancePlansContent;
  chat: ChatContent;
  blog: BlogContent;
  adminPanel: AdminPanelContent;
  seo: SeoContent;
}
