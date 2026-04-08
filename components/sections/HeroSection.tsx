'use client';

import { HeroContent, BrandingContent, MetaContent } from '@/types/content';
import { useBooking } from '@/components/booking/BookingContext';

interface HeroSectionProps {
  hero: HeroContent;
  branding: BrandingContent;
  phone: MetaContent['phone'];
}

const heroFallbacks: Record<string, string> = {
  plumbing: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&auto=format&fit=crop',
  hvac: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&auto=format&fit=crop',
  electrical: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&auto=format&fit=crop',
  mechanical: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1600&auto=format&fit=crop',
  general: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&auto=format&fit=crop',
};

export default function HeroSection({ hero, branding, phone }: HeroSectionProps) {
  const { openModal } = useBooking();
  const trade = branding.trade?.toLowerCase() ?? 'general';
  const heroImage = branding.heroImageUrl ?? heroFallbacks[trade] ?? heroFallbacks.general;

  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center text-white bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-white">
          {hero.headline}
        </h1>
        <p className="text-xl md:text-2xl mb-10 text-white/95 max-w-2xl mx-auto font-light">
          {hero.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => openModal()}
            className="px-10 py-4 rounded-lg font-semibold text-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            {hero.ctaText}
          </button>

          <a
            href={`tel:${phone}`}
            className="px-10 py-4 rounded-lg font-semibold text-lg border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all"
          >
            {hero.phoneCtaText}
          </a>
        </div>
      </div>
    </section>
  );
}
