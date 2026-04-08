import type { FaqItem, ServiceItem } from '@/types/content';

export interface KnowledgeBase {
  faq: FaqItem[];
  services: ServiceItem[];
}

/**
 * Tokenises a string into lowercase words, stripping punctuation.
 */
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Searches FAQ entries and service descriptions for term matches.
 * Returns the answer text of the first matching entry, or `null` if none found.
 *
 * Matching strategy:
 * - Tokenise the query into individual words
 * - For each FAQ entry, check if any query token appears in the question or answer
 * - For each service entry, check if any query token appears in the name or description
 * - FAQ entries are checked first, then services
 *
 * Requirements: 14.3, 14.4, 14.5
 */
export function searchKnowledgeBase(
  query: string,
  knowledgeBase: KnowledgeBase
): string | null {
  const tokens = tokenise(query);
  if (tokens.length === 0) return null;

  // Search FAQ entries first
  for (const item of knowledgeBase.faq) {
    const haystack = tokenise(`${item.question} ${item.answer}`);
    if (tokens.some((token) => haystack.includes(token))) {
      return item.answer;
    }
  }

  // Search service entries
  for (const service of knowledgeBase.services) {
    const haystack = tokenise(`${service.name} ${service.description}`);
    if (tokens.some((token) => haystack.includes(token))) {
      return service.description;
    }
  }

  return null;
}
