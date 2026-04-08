import { readBookings, bookingsToCsv } from '@/lib/bookings';

export async function GET() {
  const bookings = readBookings();
  const csv = bookingsToCsv(bookings);

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=bookings.csv',
    },
  });
}
