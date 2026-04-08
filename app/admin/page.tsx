import type { Metadata } from 'next';
import { readBookings } from '@/lib/bookings';
import { loadContent } from '@/lib/content';
import BookingsTable from '@/components/admin/BookingsTable';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  const title = `${content.adminPanel.heading} | Admin`;
  return {
    title,
    description: 'Admin panel for managing bookings.',
    openGraph: {
      title,
      description: 'Admin panel for managing bookings.',
      url: `${content.seo.siteUrl}/admin`,
    },
  };
}

export default async function AdminPage() {
  const [bookings, content] = await Promise.all([
    Promise.resolve(readBookings()),
    loadContent(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {content.adminPanel.heading}
          </h1>
          <div className="flex gap-3">
            <a
              href="/api/admin/export"
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Export CSV
            </a>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
        </p>

        <BookingsTable bookings={bookings} />
      </div>
    </div>
  );
}
