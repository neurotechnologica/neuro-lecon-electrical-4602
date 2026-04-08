'use client';

import { createContext, useContext, useState } from 'react';

interface BookingContextValue {
  isOpen: boolean;
  preselectedService: string | null;
  openModal: (service?: string) => void;
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | null>(null);

  function openModal(service?: string) {
    setPreselectedService(service ?? null);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setPreselectedService(null);
  }

  return (
    <BookingContext.Provider value={{ isOpen, preselectedService, openModal, closeModal }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider');
  return ctx;
}
