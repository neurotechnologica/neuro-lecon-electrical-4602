'use client';

import { ReviewsContent } from '@/types/content';

interface ReviewsStripProps {
  reviews: ReviewsContent;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsStrip({ reviews }: ReviewsStripProps) {
  const { aggregateRating, totalCount, items } = reviews;

  return (
    <section id="reviews" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Aggregate summary */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl font-bold text-gray-900">
              {aggregateRating.toFixed(1)}
            </span>
            <div>
              <StarRating rating={Math.round(aggregateRating)} />
              <p className="text-gray-600 text-sm mt-1">
                Based on {totalCount} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((review, index) => (
            <article
              key={index}
              className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[var(--color-accent)] hover:shadow-lg transition-all duration-300"
            >
              <StarRating rating={review.rating} />
              <p className="text-gray-700 leading-relaxed mt-4 mb-6">
                &ldquo;{review.text}&rdquo;
              </p>
              <footer className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">{review.name}</span>
                <time dateTime={review.date} className="text-gray-500">
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
