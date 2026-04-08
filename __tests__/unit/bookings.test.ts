/**
 * Unit tests for lib/bookings.ts — readBookings, appendBooking, bookingsToCsv
 * Requirements: 11.5, 17.4, 17.5
 */

import fs from 'fs';
import path from 'path';
import { readBookings, appendBooking, bookingsToCsv } from '@/lib/bookings';
import type { BookingSubmission, BookingRecord } from '@/types/booking';

const TEST_DATA_DIR = path.join(process.cwd(), 'data');
const TEST_BOOKINGS_FILE = path.join(TEST_DATA_DIR, 'bookings.json');

const sampleSubmission: BookingSubmission = {
  name: 'Jane Doe',
  phone: '555-9999',
  email: 'jane@example.com',
  service: 'Drain Unblocking',
  preferredDate: '2025-01-15',
  message: 'Blocked kitchen sink',
  submittedAt: new Date().toISOString(),
};

beforeEach(() => {
  // Reset bookings file before each test
  if (fs.existsSync(TEST_BOOKINGS_FILE)) {
    fs.writeFileSync(TEST_BOOKINGS_FILE, '[]', 'utf-8');
  }
});

afterAll(() => {
  // Clean up test data
  if (fs.existsSync(TEST_BOOKINGS_FILE)) {
    fs.writeFileSync(TEST_BOOKINGS_FILE, '[]', 'utf-8');
  }
});

describe('readBookings', () => {
  it('returns empty array when file does not exist', () => {
    if (fs.existsSync(TEST_BOOKINGS_FILE)) {
      fs.unlinkSync(TEST_BOOKINGS_FILE);
    }
    const result = readBookings();
    expect(result).toEqual([]);
  });

  it('returns empty array when file contains empty array', () => {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    fs.writeFileSync(TEST_BOOKINGS_FILE, '[]', 'utf-8');
    const result = readBookings();
    expect(result).toEqual([]);
  });

  it('returns existing bookings', () => {
    const existing: BookingRecord[] = [
      { ...sampleSubmission, id: 'test-id-1', submittedAt: new Date().toISOString() },
    ];
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    fs.writeFileSync(TEST_BOOKINGS_FILE, JSON.stringify(existing), 'utf-8');
    const result = readBookings();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-id-1');
  });
});

describe('appendBooking', () => {
  it('creates the file and appends a booking', () => {
    if (fs.existsSync(TEST_BOOKINGS_FILE)) {
      fs.unlinkSync(TEST_BOOKINGS_FILE);
    }
    const record = appendBooking(sampleSubmission);
    expect(record.id).toBeDefined();
    expect(record.name).toBe('Jane Doe');
    expect(record.service).toBe('Drain Unblocking');

    const stored = readBookings();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(record.id);
  });

  it('appends to existing bookings without overwriting', () => {
    appendBooking(sampleSubmission);
    appendBooking({ ...sampleSubmission, name: 'John Smith' });

    const stored = readBookings();
    expect(stored).toHaveLength(2);
    expect(stored[0].name).toBe('Jane Doe');
    expect(stored[1].name).toBe('John Smith');
  });

  it('generates a unique id for each booking', () => {
    const r1 = appendBooking(sampleSubmission);
    const r2 = appendBooking(sampleSubmission);
    expect(r1.id).not.toBe(r2.id);
  });

  it('sets submittedAt as an ISO 8601 string', () => {
    const record = appendBooking(sampleSubmission);
    expect(() => new Date(record.submittedAt)).not.toThrow();
    expect(new Date(record.submittedAt).toISOString()).toBe(record.submittedAt);
  });
});

describe('bookingsToCsv', () => {
  it('returns only header row for empty array', () => {
    const csv = bookingsToCsv([]);
    expect(csv).toBe('id,name,phone,email,service,preferredDate,message,submittedAt');
  });

  it('includes one data row per booking', () => {
    const bookings: BookingRecord[] = [
      { ...sampleSubmission, id: 'abc-123', submittedAt: '2025-01-01T00:00:00.000Z' },
    ];
    const csv = bookingsToCsv(bookings);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('abc-123');
    expect(lines[1]).toContain('Jane Doe');
    expect(lines[1]).toContain('Drain Unblocking');
  });

  it('escapes fields containing commas', () => {
    const bookings: BookingRecord[] = [
      {
        ...sampleSubmission,
        name: 'Doe, Jane',
        id: 'x',
        submittedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    const csv = bookingsToCsv(bookings);
    expect(csv).toContain('"Doe, Jane"');
  });

  it('escapes fields containing double quotes', () => {
    const bookings: BookingRecord[] = [
      {
        ...sampleSubmission,
        message: 'He said "hello"',
        id: 'x',
        submittedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    const csv = bookingsToCsv(bookings);
    expect(csv).toContain('"He said ""hello"""');
  });

  it('includes all required fields in header', () => {
    const csv = bookingsToCsv([]);
    const header = csv.split('\n')[0];
    ['id', 'name', 'phone', 'email', 'service', 'preferredDate', 'message', 'submittedAt'].forEach(
      (field) => {
        expect(header).toContain(field);
      }
    );
  });
});
