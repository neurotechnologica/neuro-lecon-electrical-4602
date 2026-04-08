/**
 * Property-based tests for lib/chat.ts
 * Feature: nextjs-trade-business-template
 */

import fc from 'fast-check';
import { searchKnowledgeBase } from '@/lib/chat';
import type { KnowledgeBase } from '@/lib/chat';

// Arbitraries
const wordArb = fc.stringMatching(/^[a-z]{3,10}$/);

const faqItemArb = fc.record({
  question: fc.tuple(wordArb, wordArb).map(([a, b]) => `${a} ${b}?`),
  answer: fc.tuple(wordArb, wordArb).map(([a, b]) => `${a} ${b} answer`),
});

const serviceItemArb = fc.record({
  name: wordArb,
  description: fc.tuple(wordArb, wordArb).map(([a, b]) => `${a} ${b} service`),
  icon: fc.constant('🔧'),
  ctaText: fc.constant('Book'),
});

const knowledgeBaseArb = fc.record({
  faq: fc.array(faqItemArb, { minLength: 1, maxLength: 5 }),
  services: fc.array(serviceItemArb, { minLength: 1, maxLength: 5 }),
});

// Feature: nextjs-trade-business-template, Property 17: Chat knowledge base match returns correct answer
test('searchKnowledgeBase returns a non-null answer when query contains a term from the knowledge base', () => {
  fc.assert(
    fc.property(
      knowledgeBaseArb,
      (kb: KnowledgeBase) => {
        // Pick a word that definitely exists in the FAQ
        const firstFaqWord = kb.faq[0].question.split(' ')[0];
        const result = searchKnowledgeBase(firstFaqWord, kb);
        return result !== null;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: nextjs-trade-business-template, Property 18: Chat fallback for unmatched queries
test('searchKnowledgeBase returns null when query contains no terms matching any knowledge base entry', () => {
  fc.assert(
    fc.property(
      knowledgeBaseArb,
      (kb: KnowledgeBase) => {
        // Use a query that is guaranteed not to match any entry
        // (all entries use lowercase 3-10 char words; use a numeric-only string)
        const unmatchedQuery = '12345 67890 99999';
        const result = searchKnowledgeBase(unmatchedQuery, kb);
        return result === null;
      }
    ),
    { numRuns: 100 }
  );
});
