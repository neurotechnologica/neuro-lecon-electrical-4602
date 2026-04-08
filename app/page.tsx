import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { loadContent } from '@/lib/content';
import JsonLd from '@/components/seo/JsonLd';
import EmergencyBanner from '@/components/sections/EmergencyBanner';
import HeroSection from '@/components/sections/HeroSection';
import ReviewsStrip from '@/components/sections/ReviewsStrip';
import ServicesGrid from '@/components/sections/ServicesGrid';
import DifferentiatorsSection from '@/components/sections/DifferentiatorsSection';
import AboutSection from '@/components/sections/AboutSection';
import Gallery from '@/components/sections/Gallery';
import FaqAccordion from '@/components/sections/FaqAccordion';
import MaintenancePlans from '@/components/sections/MaintenancePlans';

const ServiceAreaMap = dynamic(
  () => import('@/components/sections/ServiceAreaMap'),
  { ssr: false }
);

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  const { seo } = content;
  return {
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [{ url: `${seo.siteUrl}${seo.ogImage}` }],
      url: seo.siteUrl,
    },
  };
}

export default async function Page() {
  const content = await loadContent();
  const { seo, faq, services, meta, branding, emergencyBanner, hero, reviews, differentiators, about, gallery, serviceArea, maintenancePlans } = content;
  const lb = seo.localBusiness;

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': lb.type,
    name: lb.name,
    telephone: lb.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: lb.address.streetAddress,
      addressLocality: lb.address.addressLocality,
      addressRegion: lb.address.addressRegion,
      postalCode: lb.address.postalCode,
      addressCountry: lb.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lb.geo.latitude,
      longitude: lb.geo.longitude,
    },
    openingHours: lb.openingHours,
    url: seo.siteUrl,
  };

  const faqSchema =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : null;

  const serviceSchemas = services.map((service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: { '@type': lb.type, name: lb.name },
  }));

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {serviceSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <main>
        <EmergencyBanner emergencyBanner={emergencyBanner} phone={meta.phone} />
        <HeroSection hero={hero} branding={branding} phone={meta.phone} />
        <ReviewsStrip reviews={reviews} />
        <ServicesGrid services={services} />
        <DifferentiatorsSection differentiators={differentiators} />
        <AboutSection about={about} branding={branding} />
        <Gallery items={gallery} branding={branding} />
        <ServiceAreaMap serviceArea={serviceArea} />
        <FaqAccordion heading="Frequently Asked Questions" items={faq} />
        <MaintenancePlans maintenancePlans={maintenancePlans} />
      </main>
    </>
  );
}
