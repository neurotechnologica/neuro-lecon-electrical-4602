/**
 * Unit tests for lib/twilio.ts — twilioPlaceholder
 * Requirements: 18.1, 18.2, 18.3
 */

import { twilioPlaceholder } from '@/lib/twilio';
import type { BookingSubmission } from '@/types/booking';

const booking: BookingSubmission = {
  name: 'Jane Doe',
  phone: '555-9999',
  email: 'jane@example.com',
  service: 'Drain Unblocking',
  preferredDate: '2025-01-15',
  message: 'Blocked sink',
  submittedAt: new Date().toISOString(),
};

describe('twilioPlaceholder', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    delete process.env.TWILIO_ENABLED;
  });

  it('logs "Twilio disabled" when TWILIO_ENABLED is not set', () => {
    twilioPlaceholder(booking);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Twilio disabled')
    );
  });

  it('logs "Twilio disabled" when TWILIO_ENABLED is "false"', () => {
    process.env.TWILIO_ENABLED = 'false';
    twilioPlaceholder(booking);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Twilio disabled')
    );
  });

  it('logs real Twilio call message when TWILIO_ENABLED is "true"', () => {
    process.env.TWILIO_ENABLED = 'true';
    twilioPlaceholder(booking);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Real Twilio call would be made')
    );
  });

  it('includes recipient phone number in log when enabled', () => {
    process.env.TWILIO_ENABLED = 'true';
    twilioPlaceholder(booking);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('555-9999')
    );
  });

  it('includes booking name in log when enabled', () => {
    process.env.TWILIO_ENABLED = 'true';
    twilioPlaceholder(booking);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Jane Doe')
    );
  });
});
