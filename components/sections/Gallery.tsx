import Image from 'next/image';
import type { GalleryItem, BrandingContent } from '@/types/content';

// Use local placeholder images from public folder
const galleryFallbacks: Record<string, string[]> = {
  plumbing: [
    '/bathrenov.jpg',
    '/solarhot.jpg',
    '/piperepair.jpg',
  ],
  hvac: [
    '/solarhot.jpg',
    '/piperepair.jpg',
    '/bathrenov.jpg',
  ],
  electrical: [
    '/piperepair.jpg',
    '/bathrenov.jpg',
    '/solarhot.jpg',
  ],
  mechanical: [
    '/solarhot.jpg',
    '/bathrenov.jpg',
    '/piperepair.jpg',
  ],
  general: [
    '/bathrenov.jpg',
    '/piperepair.jpg',
    '/solarhot.jpg',
  ],
};

interface GalleryProps {
  items: GalleryItem[];
  branding: BrandingContent;
}

export default function Gallery({ items, branding }: GalleryProps) {
  const allPlaceholder = !items || items.length === 0 || items.every((i) => i.isPlaceholder);
  const trade = branding.trade?.toLowerCase() ?? 'general';
  const fallbacks = galleryFallbacks[trade] ?? galleryFallbacks.general;

  const displayItems = allPlaceholder 
    ? fallbacks.map((src) => ({ src, alt: 'Work sample', isPlaceholder: true }))
    : items.filter((i) => !i.isPlaceholder && i.src);

  // Ensure we have at least 3 items for the collage layout
  const galleryItems = displayItems.length >= 3 ? displayItems : [
    ...displayItems,
    ...fallbacks.slice(0, 3 - displayItems.length).map(src => ({ src, alt: 'Work sample', isPlaceholder: true }))
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Recent Projects</h2>
          <p className="text-xl text-gray-600">See our quality work in action</p>
        </div>

        {/* Collage Layout - inspired by the reference image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Large left image */}
          {galleryItems[0] && (
            <div className="md:row-span-2 group relative aspect-[3/4] md:aspect-auto overflow-hidden rounded-2xl border border-gray-200 hover:border-[var(--color-accent)] transition-all duration-300 shadow-lg">
              <Image
                src={galleryItems[0].src}
                alt={galleryItems[0].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-wider mb-2">Full Renovation</p>
                  <p className="text-2xl font-bold">Featured Project</p>
                </div>
              </div>
            </div>
          )}

          {/* Top right image */}
          {galleryItems[1] && (
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 hover:border-[var(--color-accent)] transition-all duration-300 shadow-lg">
              <Image
                src={galleryItems[1].src}
                alt={galleryItems[1].alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-lg font-bold">Commercial Work</p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom right - split into two smaller images */}
          <div className="grid grid-cols-2 gap-6">
            {galleryItems[2] && (
              <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 hover:border-[var(--color-accent)] transition-all duration-300 shadow-lg">
                <Image
                  src={galleryItems[2].src}
                  alt={galleryItems[2].alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-sm font-bold">Kitchen Fitting</p>
                  </div>
                </div>
              </div>
            )}

            {galleryItems[3] && (
              <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 hover:border-[var(--color-accent)] transition-all duration-300 shadow-lg">
                <Image
                  src={galleryItems[3].src}
                  alt={galleryItems[3].alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-sm font-bold">Pipework Precision</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
