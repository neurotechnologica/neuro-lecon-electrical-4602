import type { BookingSubmission } from '@/types/booking';

/**
 * Placeholder for Twilio SMS integration.
 * When TWILIO_ENABLED=true, logs that a real call would be made.
 * Otherwise logs that Twilio is disabled.
 */
export function twilioPlaceholder(booking: BookingSubmission): void {
  const enabled = process.env.TWILIO_ENABLED === 'true';
  if (enabled) {
    console.log(
      `[Twilio] Real Twilio call would be made — recipient: ${booking.phone}, body: New booking from ${booking.name} for ${booking.service} on ${booking.preferredDate}`
    );
  } else {
    console.log('[Twilio] Twilio disabled — no SMS sent');
  }
}
