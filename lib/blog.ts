import { notFound } from 'next/navigation';
import { loadContent } from '@/lib/content';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  metaDescription: string;
  body: string;
}

/** Returns all blog posts from content.json. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const content = await loadContent();
  return content.blog.posts;
}

/** Returns a single post by slug, or calls notFound() if not found. */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const content = await loadContent();
  const post = content.blog.posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return post;
}
