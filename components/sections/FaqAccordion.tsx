'use client';

import { useState } from 'react';
import { FaqItem } from '@/types/content';

interface FaqAccordionProps {
  heading: string;
  items: FaqItem[];
}

export default function FaqAccordion({ heading, items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="section-label">FAQ</span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            {heading}
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-colors ${isOpen ? 'border-[var(--color-accent)]/40 bg-gray-50' : 'border-gray-100 bg-white'}`}
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-gray-800 hover:text-[var(--color-primary)] transition-colors"
                >
                  <span>{item.question}</span>
                  <span
                    className="ml-4 shrink-0 text-[var(--color-accent)] transition-transform duration-200 text-lg"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  hidden={!isOpen}
                  className="px-6 pb-5 text-gray-500 leading-relaxed text-sm"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
