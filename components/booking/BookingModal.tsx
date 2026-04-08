'use client';

import { useEffect, useRef, useState } from 'react';
import { useBooking } from '@/components/booking/BookingContext';
import type { BookingContent } from '@/types/content';

interface BookingModalProps {
  booking: BookingContent;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  message: string;
}

export default function BookingModal({ booking }: BookingModalProps) {
  const { isOpen, preselectedService, closeModal } = useBooking();
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', email: '', service: '', preferredDate: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Sync preselected service when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(prev => ({ ...prev, service: preselectedService ?? '' }));
      setStatus('idle');
    }
  }, [isOpen, preselectedService]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') trapFocus(e);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeModal]);

  // Focus first element when opened
  useEffect(() => {
    if (isOpen) firstFocusableRef.current?.focus();
  }, [isOpen]);

  function trapFocus(e: KeyboardEvent) {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submittedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
      setTimeout(() => closeModal(), 3000);
    } catch {
      setStatus('error');
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="booking-modal-title" className="text-xl font-semibold text-gray-900">
            {booking.heading}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={closeModal}
            aria-label="Close booking modal"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div role="alert" className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-700 text-lg">{booking.confirmationMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bm-name" className="block text-sm font-medium text-gray-700 mb-1">
                    {booking.fields.name} <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="bm-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="bm-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {booking.fields.phone} <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="bm-phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="bm-email" className="block text-sm font-medium text-gray-700 mb-1">
                    {booking.fields.email} <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="bm-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="bm-service" className="block text-sm font-medium text-gray-700 mb-1">
                    {booking.fields.service}
                  </label>
                  <input
                    id="bm-service"
                    name="service"
                    type="text"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="bm-preferredDate" className="block text-sm font-medium text-gray-700 mb-1">
                    {booking.fields.preferredDate}
                  </label>
                  <input
                    id="bm-preferredDate"
                    name="preferredDate"
                    type="date"
                    value={form.preferredDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label htmlFor="bm-message" className="block text-sm font-medium text-gray-700 mb-1">
                    {booking.fields.message}
                  </label>
                  <textarea
                    id="bm-message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                  />
                </div>
              </div>

              {status === 'error' && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {booking.errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-6 w-full py-3 px-6 rounded-lg font-semibold text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {status === 'submitting' ? 'Submitting…' : booking.submitText}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
