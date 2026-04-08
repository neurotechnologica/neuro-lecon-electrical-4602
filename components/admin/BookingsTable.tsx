'use client';

import { useState } from 'react';
import type { BookingRecord } from '@/types/booking';

type SortKey = keyof Pick<
  BookingRecord,
  'name' | 'phone' | 'email' | 'service' | 'preferredDate' | 'submittedAt'
>;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'service', label: 'Service' },
  { key: 'preferredDate', label: 'Preferred Date' },
  { key: 'submittedAt', label: 'Submitted At' },
];

export default function BookingsTable({ bookings }: { bookings: BookingRecord[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const sorted = [...bookings].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortAsc ? cmp : -cmp;
  });

  if (bookings.length === 0) {
    return <p className="text-gray-500 text-sm">No bookings yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="px-4 py-3 font-medium text-gray-700 cursor-pointer select-none whitespace-nowrap hover:bg-gray-100"
              >
                {label}
                {sortKey === key && (
                  <span className="ml-1 text-gray-400">{sortAsc ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">{booking.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <a href={`tel:${booking.phone}`} className="text-[var(--color-primary)] hover:underline">
                  {booking.phone}
                </a>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <a href={`mailto:${booking.email}`} className="text-[var(--color-primary)] hover:underline">
                  {booking.email}
                </a>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{booking.service}</td>
              <td className="px-4 py-3 whitespace-nowrap">{booking.preferredDate}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                {new Date(booking.submittedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
