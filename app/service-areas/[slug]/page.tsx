import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadContent } from '@/lib/content';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const content = await loadContent();
  return content.serviceArea.locations.map((loc) => ({ slug: loc.slug }));
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = await loadContent();
  const location = content.serviceArea.locations.find((loc) => loc.slug === params.slug);
  if (!location) return {};
  const { seo } = content;
  const primaryService = content.services[0].name;
  const title = `${primaryService} in ${location.name} | ${seo.localBusiness.name}`;
  const description = location.description;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `${seo.siteUrl}${seo.ogImage}` }],
      url: `${seo.siteUrl}/service-areas/${location.slug}`,
    },
  };
}

export default async function ServiceAreaPage({ params }: Props) {
  const content = await loadContent();
  const location = content.serviceArea.locations.find((loc) => loc.slug === params.slug);

  if (!location) {
    notFound();
  }

  const primaryService = content.services[0].name;
  const businessName = content.seo.localBusiness.name;
  const lb = content.seo.localBusiness;

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': lb.type,
    name: `${businessName} - ${location.name}`,
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
      latitude: location.coords.lat,
      longitude: location.coords.lng,
    },
    openingHours: lb.openingHours,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-[var(--color-primary)]">
          {primaryService} in {location.name}
        </h1>
        <p className="text-lg text-gray-700">{location.description}</p>
      </main>
    </>
  );
}
