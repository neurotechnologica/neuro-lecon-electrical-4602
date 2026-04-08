import type { ContentSchema } from '@/types/content';

export type { ContentSchema };

// Required field paths (dot-notation) that must be present in content.json
const REQUIRED_PATHS: string[] = [
  'meta',
  'meta.businessName',
  'meta.phone',
  'meta.email',
  'meta.address',
  'meta.tradeType',
  'branding',
  'branding.trade',
  'branding.primaryColor',
  'branding.accentColor',
  'header',
  'header.logoUrl',
  'header.navLinks',
  'hero',
  'hero.headline',
  'hero.subheadline',
  'hero.ctaText',
  'hero.ctaLink',
  'hero.backgroundImage',
  'hero.phoneCtaText',
  'emergencyBanner',
  'emergencyBanner.enabled',
  'emergencyBanner.message',
  'reviews',
  'reviews.aggregateRating',
  'reviews.totalCount',
  'reviews.items',
  'services',
  'differentiators',
  'differentiators.heading',
  'differentiators.subheading',
  'differentiators.items',
  'about',
  'about.story',
  'about.teamImage',
  'about.yearsInBusiness',
  'about.certifications',
  'about.ctaText',
  'gallery',
  'serviceArea',
  'serviceArea.heading',
  'serviceArea.description',
  'serviceArea.center',
  'serviceArea.center.lat',
  'serviceArea.center.lng',
  'serviceArea.zoom',
  'serviceArea.polygon',
  'serviceArea.locations',
  'booking',
  'booking.heading',
  'booking.fields',
  'booking.fields.name',
  'booking.fields.phone',
  'booking.fields.email',
  'booking.fields.service',
  'booking.fields.preferredDate',
  'booking.fields.message',
  'booking.submitText',
  'booking.confirmationMessage',
  'booking.errorMessage',
  'faq',
  'maintenancePlans',
  'maintenancePlans.enabled',
  'maintenancePlans.heading',
  'maintenancePlans.plans',
  'chat',
  'chat.greeting',
  'chat.fallbackMessage',
  'blog',
  'blog.heading',
  'blog.postsPerPage',
  'blog.posts',
  'adminPanel',
  'adminPanel.heading',
  'seo',
  'seo.defaultTitle',
  'seo.defaultDescription',
  'seo.ogImage',
  'seo.siteUrl',
  'seo.localBusiness',
  'seo.localBusiness.name',
  'seo.localBusiness.type',
  'seo.localBusiness.telephone',
  'seo.localBusiness.address',
  'seo.localBusiness.address.streetAddress',
  'seo.localBusiness.address.addressLocality',
  'seo.localBusiness.address.addressRegion',
  'seo.localBusiness.address.postalCode',
  'seo.localBusiness.address.addressCountry',
  'seo.localBusiness.geo',
  'seo.localBusiness.geo.latitude',
  'seo.localBusiness.geo.longitude',
  'seo.localBusiness.openingHours',
];

/** Reads a nested value from an object using a dot-notation path. */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current !== null && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Validates all required fields in the content object.
 * Throws `Error: Missing required field: <dot.notation.path>` for the first missing field.
 */
export function validateContent(content: unknown): asserts content is ContentSchema {
  for (const path of REQUIRED_PATHS) {
    const value = getNestedValue(content, path);
    if (value === undefined || value === null) {
      throw new Error(`Missing required field: ${path}`);
    }
  }
}

let cachedContent: ContentSchema | null = null;

/**
 * Loads and validates content from /public/content.json.
 * - Server-side: reads synchronously via `fs`
 * - Client-side: fetches via `fetch`
 * Result is cached after first load.
 */
export async function loadContent(): Promise<ContentSchema> {
  if (cachedContent) return cachedContent;

  let raw: unknown;

  if (typeof window === 'undefined') {
    // Server-side: read synchronously
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'content.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    raw = JSON.parse(fileContents);
  } else {
    // Client-side: fetch from public URL
    const res = await fetch('/content.json');
    if (!res.ok) {
      throw new Error(`Failed to load content.json: ${res.status} ${res.statusText}`);
    }
    raw = await res.json();
  }

  validateContent(raw);
  cachedContent = raw;
  return cachedContent;
}

/** Clears the content cache (useful for testing). */
export function clearContentCache(): void {
  cachedContent = null;
}
