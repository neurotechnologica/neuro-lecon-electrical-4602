/**
 * Unit tests for lib/chat.ts — searchKnowledgeBase
 * Requirements: 14.3, 14.4, 14.5
 */

import { searchKnowledgeBase } from '@/lib/chat';
import type { KnowledgeBase } from '@/lib/chat';

const kb: KnowledgeBase = {
  faq: [
    { question: 'Do you charge a call-out fee?', answer: 'No call-out fee before 8pm.' },
    { question: 'Are your plumbers licensed?', answer: 'Yes, all plumbers are fully licensed.' },
  ],
  services: [
    {
      name: 'Emergency Plumbing',
      description: 'Burst pipes handled 24/7.',
      icon: '🚨',
      ctaText: 'Book',
    },
    {
      name: 'Drain Unblocking',
      description: 'Blocked sink or toilet cleared fast.',
      icon: '🔧',
      ctaText: 'Book',
    },
  ],
};

describe('searchKnowledgeBase', () => {
  it('returns FAQ answer when query matches FAQ question', () => {
    const result = searchKnowledgeBase('call-out fee', kb);
    expect(result).toBe('No call-out fee before 8pm.');
  });

  it('returns FAQ answer when query matches FAQ answer text', () => {
    const result = searchKnowledgeBase('licensed', kb);
    expect(result).toBe('Yes, all plumbers are fully licensed.');
  });

  it('returns service description when query matches service name', () => {
    const result = searchKnowledgeBase('emergency', kb);
    expect(result).toBe('Burst pipes handled 24/7.');
  });

  it('returns service description when query matches service description', () => {
    const result = searchKnowledgeBase('drain', kb);
    expect(result).toBe('Blocked sink or toilet cleared fast.');
  });

  it('returns null when no match found', () => {
    const result = searchKnowledgeBase('xyzzy unrelated query', kb);
    expect(result).toBeNull();
  });

  it('returns null for empty query', () => {
    const result = searchKnowledgeBase('', kb);
    expect(result).toBeNull();
  });

  it('returns null for whitespace-only query', () => {
    const result = searchKnowledgeBase('   ', kb);
    expect(result).toBeNull();
  });

  it('is case-insensitive', () => {
    const result = searchKnowledgeBase('EMERGENCY', kb);
    expect(result).not.toBeNull();
  });

  it('FAQ entries take priority over service entries', () => {
    // "licensed" appears in FAQ, not services — should return FAQ answer
    const result = searchKnowledgeBase('licensed', kb);
    expect(result).toBe('Yes, all plumbers are fully licensed.');
  });

  it('returns null when knowledge base is empty', () => {
    const result = searchKnowledgeBase('anything', { faq: [], services: [] });
    expect(result).toBeNull();
  });
});
