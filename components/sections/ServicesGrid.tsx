'use client';

import { useState } from 'react';
import { ServiceItem } from '@/types/content';
import { useBooking } from '@/components/booking/BookingContext';

interface ServicesGridProps {
  services: ServiceItem[];
}

const iconMap: Record<string, string> = {
  '🚨': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  '🔧': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  '🌡️': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  '💧': 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
  '🛁': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  '🔥': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
};

function ServiceIcon({ emoji }: { emoji: string }) {
  const path = iconMap[emoji];
  if (!path) {
    return <span className="text-3xl">{emoji}</span>;
  }
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  const { openModal } = useBooking();
  const [showAll, setShowAll] = useState(false);
  const displayedServices = showAll ? services : services.slice(0, 3);
  const hasMore = services.length > 3;

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Professional solutions tailored to your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedServices.map((service, index) => (
            <article
              key={index}
              className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[var(--color-accent)] hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white mb-6">
                <ServiceIcon emoji={service.icon} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                {service.name}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>

              {service.priceIndicator && (
                <p className="text-lg font-semibold text-[var(--color-accent)] mb-6">
                  {service.priceIndicator}
                </p>
              )}

              <button
                onClick={() => openModal(service.name)}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all"
              >
                {service.ctaText}
              </button>
            </article>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 rounded-lg font-semibold text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300"
            >
              {showAll ? 'Show Less Services' : 'Show More Services'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
