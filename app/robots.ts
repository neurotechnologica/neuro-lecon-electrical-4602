import type { MetadataRoute } from 'next';
import { loadContent } from '@/lib/content';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await loadContent();
  const siteUrl = content.seo.siteUrl;

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
