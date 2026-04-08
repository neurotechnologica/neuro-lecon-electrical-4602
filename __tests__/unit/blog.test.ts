/**
 * Unit tests for lib/blog.ts — getAllPosts, getPostBySlug
 * Requirements: 15.1, 15.2, 15.5
 */

import { getAllPosts, getPostBySlug } from '@/lib/blog';

// Mock loadContent to avoid filesystem reads in tests
jest.mock('@/lib/content', () => ({
  loadContent: jest.fn().mockResolvedValue({
    blog: {
      heading: 'Blog',
      postsPerPage: 6,
      posts: [
        {
          slug: 'first-post',
          title: 'First Post',
          date: '2024-01-01',
          excerpt: 'First excerpt',
          metaDescription: 'First meta',
          body: '# First Post\n\nContent here.',
        },
        {
          slug: 'second-post',
          title: 'Second Post',
          date: '2024-02-01',
          excerpt: 'Second excerpt',
          metaDescription: 'Second meta',
          body: '# Second Post\n\nMore content.',
        },
      ],
    },
  }),
}));

// Mock next/navigation notFound
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('getAllPosts', () => {
  it('returns all posts from content.json', async () => {
    const posts = await getAllPosts();
    expect(posts).toHaveLength(2);
  });

  it('each post has required fields', async () => {
    const posts = await getAllPosts();
    for (const post of posts) {
      expect(post.slug).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.date).toBeDefined();
      expect(post.excerpt).toBeDefined();
      expect(post.metaDescription).toBeDefined();
      expect(post.body).toBeDefined();
    }
  });

  it('returns posts with correct slugs', async () => {
    const posts = await getAllPosts();
    const slugs = posts.map((p) => p.slug);
    expect(slugs).toContain('first-post');
    expect(slugs).toContain('second-post');
  });
});

describe('getPostBySlug', () => {
  it('returns the correct post for a valid slug', async () => {
    const post = await getPostBySlug('first-post');
    expect(post.slug).toBe('first-post');
    expect(post.title).toBe('First Post');
  });

  it('returns post with body field', async () => {
    const post = await getPostBySlug('second-post');
    expect(post.body).toContain('Second Post');
  });

  it('calls notFound() for an unknown slug', async () => {
    await expect(getPostBySlug('nonexistent-slug')).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
