/**
 * Property-based tests for lib/content.ts
 * Feature: nextjs-trade-business-template
 */

import fc from 'fast-check';
import { validateContent } from '@/lib/content';
import type { ContentSchema } from '@/types/content';

// Required field paths that must be present in content.json
const REQUIRED_FIELD_PATHS = [
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

function buildValidContent(): ContentSchema {
  return {
    meta: {
      businessName: 'Test Co.',
      phone: '555-0000',
      email: 'test@example.com',
      address: '1 Test St',
      tradeType: 'plumber',
    },
    branding: {
      trade: 'Plumbing',
      primaryColor: '#000',
      accentColor: '#fff',
      logoUrl: null,
      heroImageUrl: null,
      ownerName: null,
      ownerPhotoUrl: null,
      ownerStory: null,
    },
    header: { logoUrl: '/logo.svg', navLinks: [] },
    hero: {
      headline: 'Headline',
      subheadline: 'Sub',
      ctaText: 'Book',
      ctaLink: '#',
      backgroundImage: '/bg.jpg',
      phoneCtaText: 'Call',
    },
    emergencyBanner: { enabled: false, message: 'Emergency' },
    reviews: { aggregateRating: 5, totalCount: 0, items: [] },
    services: [],
    differentiators: { heading: 'Why', subheading: 'Because', items: [] },
    about: {
      story: 'Story',
      teamImage: '/team.jpg',
      yearsInBusiness: 1,
      certifications: [],
      ctaText: 'Book',
    },
    gallery: [],
    serviceArea: {
      heading: 'Area',
      description: 'Desc',
      center: { lat: 0, lng: 0 },
      zoom: 10,
      polygon: [],
      locations: [],
    },
    booking: {
      heading: 'Book',
      fields: {
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        service: 'Service',
        preferredDate: 'Date',
        message: 'Message',
      },
      submitText: 'Submit',
      confirmationMessage: 'Confirmed',
      errorMessage: 'Error',
    },
    faq: [],
    maintenancePlans: { enabled: false, heading: 'Plans', plans: [] },
    chat: { greeting: 'Hi', fallbackMessage: 'Call us' },
    blog: { heading: 'Blog', postsPerPage: 6, posts: [] },
    adminPanel: { heading: 'Admin' },
    seo: {
      defaultTitle: 'Title',
      defaultDescription: 'Desc',
      ogImage: '/og.jpg',
      siteUrl: 'https://example.com',
      localBusiness: {
        name: 'Test Co.',
        type: 'Plumber',
        telephone: '555-0000',
        address: {
          streetAddress: '1 Test St',
          addressLocality: 'Springfield',
          addressRegion: 'IL',
          postalCode: '62701',
          addressCountry: 'US',
        },
        geo: { latitude: 0, longitude: 0 },
        openingHours: ['Mo-Fr 09:00-17:00'],
      },
    },
  };
}

/** Delete a nested field by dot-notation path */
function deleteNestedField(obj: Record<string, unknown>, path: string): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === null || typeof current[part] !== 'object') return;
    current = current[part] as Record<string, unknown>;
  }
  delete current[parts[parts.length - 1]];
}

// Feature: nextjs-trade-business-template, Property 1: Content validation error includes dot-notation path
test('validateContent throws with dot-notation path for any missing required field', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...REQUIRED_FIELD_PATHS),
      (fieldPath) => {
        const content = buildValidContent() as unknown as Record<string, unknown>;
        deleteNestedField(content, fieldPath);
        let threw = false;
        let errorMessage = '';
        try {
          validateContent(content);
        } catch (e) {
          threw = true;
          errorMessage = (e as Error).message;
        }
        return threw && errorMessage.includes(fieldPath);
      }
    ),
    { numRuns: 100 }
  );
});
