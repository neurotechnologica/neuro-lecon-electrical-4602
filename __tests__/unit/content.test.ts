/**
 * Unit tests for lib/content.ts — loadContent and validateContent
 * Requirements: 1.1, 1.3, 1.4
 */

import { validateContent, clearContentCache } from '@/lib/content';
import type { ContentSchema } from '@/types/content';

// Build a minimal valid content object for testing
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
    header: {
      logoUrl: '/logo.svg',
      navLinks: [{ label: 'Home', href: '/' }],
    },
    hero: {
      headline: 'Test Headline',
      subheadline: 'Test Sub',
      ctaText: 'Book Now',
      ctaLink: '#booking',
      backgroundImage: '/bg.jpg',
      phoneCtaText: 'Call us',
    },
    emergencyBanner: { enabled: false, message: 'Emergency!' },
    reviews: {
      aggregateRating: 5,
      totalCount: 10,
      items: [],
    },
    services: [],
    differentiators: {
      heading: 'Why Us',
      subheading: 'Because we are great',
      items: [],
    },
    about: {
      story: 'Our story',
      teamImage: '/team.jpg',
      yearsInBusiness: 10,
      certifications: [],
      ctaText: 'Book',
    },
    gallery: [],
    serviceArea: {
      heading: 'Service Area',
      description: 'We serve here',
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
      confirmationMessage: 'Confirmed!',
      errorMessage: 'Error!',
    },
    faq: [],
    maintenancePlans: {
      enabled: false,
      heading: 'Plans',
      plans: [],
    },
    chat: {
      greeting: 'Hello!',
      fallbackMessage: 'Call us.',
    },
    blog: {
      heading: 'Blog',
      postsPerPage: 6,
      posts: [],
    },
    adminPanel: { heading: 'Admin' },
    seo: {
      defaultTitle: 'Test',
      defaultDescription: 'Test desc',
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

describe('validateContent', () => {
  it('passes for a fully valid content object', () => {
    expect(() => validateContent(buildValidContent())).not.toThrow();
  });

  it('throws when meta is missing', () => {
    const content = buildValidContent() as Record<string, unknown>;
    delete content.meta;
    expect(() => validateContent(content)).toThrow('Missing required field: meta');
  });

  it('throws with dot-notation path for missing nested field', () => {
    const content = buildValidContent();
    // @ts-expect-error intentionally deleting required field
    delete content.seo.localBusiness.geo;
    expect(() => validateContent(content)).toThrow('seo.localBusiness.geo');
  });

  it('throws for missing meta.businessName', () => {
    const content = buildValidContent();
    // @ts-expect-error intentionally deleting required field
    delete content.meta.businessName;
    expect(() => validateContent(content)).toThrow('meta.businessName');
  });

  it('throws for missing booking.fields.email', () => {
    const content = buildValidContent();
    // @ts-expect-error intentionally deleting required field
    delete content.booking.fields.email;
    expect(() => validateContent(content)).toThrow('booking.fields.email');
  });

  it('throws for missing seo.localBusiness.address.postalCode', () => {
    const content = buildValidContent();
    // @ts-expect-error intentionally deleting required field
    delete content.seo.localBusiness.address.postalCode;
    expect(() => validateContent(content)).toThrow('seo.localBusiness.address.postalCode');
  });

  it('throws for null top-level field', () => {
    const content = buildValidContent() as Record<string, unknown>;
    content.hero = null;
    expect(() => validateContent(content)).toThrow('hero');
  });

  it('throws for missing hero.headline', () => {
    const content = buildValidContent();
    // @ts-expect-error intentionally deleting required field
    delete content.hero.headline;
    expect(() => validateContent(content)).toThrow('hero.headline');
  });
});
