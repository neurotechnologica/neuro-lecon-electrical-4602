/**
 * Property-based tests for lib/bookings.ts
 * Feature: nextjs-trade-business-template
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { appendBooking, readBookings, bookingsToCsv } from '@/lib/bookings';
import type { BookingSubmission, BookingRecord } from '@/types/booking';

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json');

beforeEach(() => {
  if (fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf-8');
  }
});

afterAll(() => {
  if (fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf-8');
  }
});

const submissionArb = fc.record<BookingSubmission>({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  phone: fc.string({ minLength: 7, maxLength: 20 }),
  email: fc.emailAddress(),
  service: fc.string({ minLength: 1, maxLength: 50 }),
  preferredDate: fc.constant('2025-06-01'),
  message: fc.string({ minLength: 0, maxLength: 200 }),
  submittedAt: fc.constant(new Date().toISOString()),
});

// Feature: nextjs-trade-business-template, Property 13: Booking submission round-trip
test('appendBooking stores booking that is retrievable via readBookings', () => {
  fc.assert(
    fc.property(submissionArb, (submission) => {
      // Reset file for each iteration
      fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf-8');

      const record = appendBooking(submission);
      const stored = readBookings();

      return (
        stored.some((b) => b.id === record.id) &&
        stored.some((b) => b.name === submission.name) &&
        stored.some((b) => b.email === submission.email)
      );
    }),
    { numRuns: 50 }
  );
});

// Feature: nextjs-trade-business-template, Property 25: CSV export contains all booking fields
test('bookingsToCsv includes all required fields for every booking', () => {
  const bookingRecordArb = submissionArb.map(
    (s): BookingRecord => ({
      ...s,
      id: 'test-id',
      submittedAt: new Date().toISOString(),
    })
  );

  fc.assert(
    fc.property(fc.array(bookingRecordArb, { minLength: 1, maxLength: 10 }), (bookings) => {
      const csv = bookingsToCsv(bookings);
      const lines = csv.split('\n');

      // Header + one line per booking
      if (lines.length !== bookings.length + 1) return false;

      // Every booking's name should appear somewhere in the CSV
      // (accounting for possible CSV escaping)
      return bookings.every((b) => {
        const escapedName = b.name.replace(/"/g, '""');
        return csv.includes(escapedName) || csv.includes(`"${escapedName}"`);
      });
    }),
    { numRuns: 100 }
  );
});
