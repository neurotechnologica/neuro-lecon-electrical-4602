'use client';

import Image from 'next/image';
import { AboutContent, BrandingContent } from '@/types/content';
import { useBooking } from '@/components/booking/BookingContext';

interface AboutSectionProps {
  about: AboutContent;
  branding: BrandingContent;
}

const isPlaceholder = (v: string | null | undefined) =>
  !v || v.startsWith('[PLACEHOLDER');

export default function AboutSection({ about, branding }: AboutSectionProps) {
  const { openModal } = useBooking();
  const story = branding.ownerStory && !isPlaceholder(branding.ownerStory)
    ? branding.ownerStory
    : isPlaceholder(about.story) ? null : about.story;

  // Use plumberguy.jpg as fallback if no owner photo
  const ownerPhoto = branding.ownerPhotoUrl || '/plumberguy.jpg';

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image column */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4]">
              <Image
                src={ownerPhoto}
                alt={branding.ownerName ?? 'Professional tradesperson'}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content column */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Decades of Professional Excellence
              </h2>
              {story ? (
                <p className="text-lg text-gray-600 leading-relaxed">{story}</p>
              ) : (
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-xl p-6">
                  <p className="text-yellow-800 text-sm italic">Add your business story to branding.ownerStory in content.json</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                  {about.yearsInBusiness}+
                </div>
                <div className="text-gray-600 text-sm font-medium">Years Experience</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                  {about.certifications.length}
                </div>
                <div className="text-gray-600 text-sm font-medium">Certifications</div>
              </div>
            </div>

            {about.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Certifications & Licenses</h3>
                <div className="flex flex-wrap gap-3">
                  {about.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => openModal()}
              className="self-start px-8 py-4 rounded-lg font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 transition-all shadow-lg"
            >
              {about.ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
