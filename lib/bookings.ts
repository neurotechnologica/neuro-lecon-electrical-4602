import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { BookingRecord, BookingSubmission } from '@/types/booking';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

const CSV_HEADER = 'id,name,phone,email,service,preferredDate,message,submittedAt';

/** Ensures data/ directory and bookings.json exist, initialising with [] if absent. */
function ensureBookingsFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf-8');
  }
}

/** Reads all bookings from data/bookings.json. Returns [] if file is absent or empty. */
export function readBookings(): BookingRecord[] {
  ensureBookingsFile();
  const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8').trim();
  if (!raw || raw === '[]') return [];
  return JSON.parse(raw) as BookingRecord[];
}

/**
 * Appends a new booking to data/bookings.json using a read→append→write pattern.
 * Generates a uuid v4 id and sets submittedAt to the current ISO timestamp.
 */
export function appendBooking(submission: BookingSubmission): BookingRecord {
  ensureBookingsFile();

  // Read current records
  const records = readBookings();

  // Build new record
  const record: BookingRecord = {
    ...submission,
    id: uuidv4(),
    submittedAt: new Date().toISOString(),
  };

  records.push(record);

  // Write back atomically
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(records, null, 2), 'utf-8');

  return record;
}

/** Escapes a CSV field value by wrapping in quotes if it contains commas, quotes, or newlines. */
function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Returns a CSV string with a header row and one data row per booking. */
export function bookingsToCsv(bookings: BookingRecord[]): string {
  const rows = bookings.map((b) =>
    [b.id, b.name, b.phone, b.email, b.service, b.preferredDate, b.message, b.submittedAt]
      .map(escapeCsvField)
      .join(',')
  );
  return [CSV_HEADER, ...rows].join('\n');
}
