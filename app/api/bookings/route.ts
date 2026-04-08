import { NextRequest, NextResponse } from 'next/server';
import { appendBooking } from '@/lib/bookings';
import { twilioPlaceholder } from '@/lib/twilio';
import type { BookingSubmission } from '@/types/booking';

const REQUIRED_FIELDS: (keyof BookingSubmission)[] = [
  'name',
  'phone',
  'email',
  'service',
  'preferredDate',
  'message',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate required fields
  const missing = REQUIRED_FIELDS.filter(
    (field) => !body[field] || typeof body[field] !== 'string' || (body[field] as string).trim() === ''
  );

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  const submission: BookingSubmission = {
    name: (body.name as string).trim(),
    phone: (body.phone as string).trim(),
    email: (body.email as string).trim(),
    service: (body.service as string).trim(),
    preferredDate: (body.preferredDate as string).trim(),
    message: (body.message as string).trim(),
    submittedAt: new Date().toISOString(),
  };

  try {
    const record = appendBooking(submission);
    twilioPlaceholder(submission);
    return NextResponse.json({ success: true, id: record.id }, { status: 200 });
  } catch (err) {
    console.error('[/api/bookings] Failed to save booking:', err);
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
  }
}
