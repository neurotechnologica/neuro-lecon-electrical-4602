'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ContentSchema } from '@/types/content';

interface HeaderProps {
  content: ContentSchema;
}

function LogoMark({ logoUrl, businessName, size }: { logoUrl: string | null; businessName: string; size: number }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${businessName} logo`}
        width={size}
        height={size}
        className="object-contain"
      />
    );
  }
  return (
    <div
      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg select-none border-2 border-white/30"
    >
      {businessName.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function Header({ content }: HeaderProps) {
  const [navOpen, setNavOpen] = useState(false);
  const { meta, header, branding } = content;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-lg">
      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        {/* Logo + business name */}
        <Link href="/" className="flex items-center gap-3 group">
          <LogoMark logoUrl={branding.logoUrl} businessName={meta.businessName} size={40} />
          <span className="font-bold text-lg tracking-tight">{meta.businessName}</span>
        </Link>

        {/* Nav links + phone */}
        <nav className="flex items-center gap-7 text-sm font-medium">
          {header.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`tel:${meta.phone}`}
            className="ml-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] hover:brightness-110 transition-all font-semibold text-sm text-white shadow-md"
          >
            {meta.phone}
          </a>
        </nav>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        {/* Call bar */}
        <a
          href={`tel:${meta.phone}`}
          className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-accent)] text-white font-semibold text-sm"
        >
          <span>📞</span>
          <span>{meta.phone}</span>
        </a>

        {/* Logo + hamburger */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark logoUrl={branding.logoUrl} businessName={meta.businessName} size={32} />
            <span className="font-bold">{meta.businessName}</span>
          </Link>

          <button
            onClick={() => setNavOpen((o) => !o)}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            className="p-2 rounded hover:bg-white/10 transition-colors"
          >
            {navOpen ? (
              // X icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {navOpen && (
          <nav className="flex flex-col border-t border-white/20">
            {header.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setNavOpen(false)}
                className="px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
