import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { loadContent } from '@/lib/content';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  const { seo } = content;
  const title = `Blog | ${seo.localBusiness.name}`;
  const description = `Plumbing tips, news, and advice from ${seo.localBusiness.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `${seo.siteUrl}${seo.ogImage}` }],
      url: `${seo.siteUrl}/blog`,
    },
  };
}

export default async function BlogPage() {
  const [posts, content] = await Promise.all([getAllPosts(), loadContent()]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-[var(--color-primary)]">
        {content.blog.heading}
      </h1>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-gray-200 pb-8">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-primary)] group-hover:underline mb-1">
                {post.title}
              </h2>
            </Link>
            <time className="text-sm text-gray-500 mb-2 block" dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <p className="text-gray-700">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-block mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Read more →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
