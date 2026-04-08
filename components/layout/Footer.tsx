import type { ContentSchema } from '@/types/content';

interface FooterProps {
  content: ContentSchema;
}

export default function Footer({ content }: FooterProps) {
  const { meta } = content;

  return (
    <footer className="bg-[var(--color-primary)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
        <p className="font-semibold text-base">{meta.businessName}</p>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-white/80">
          <a href={`tel:${meta.phone}`} className="hover:text-white transition-colors">
            {meta.phone}
          </a>
          <a href={`mailto:${meta.email}`} className="hover:text-white transition-colors">
            {meta.email}
          </a>
          <span>{meta.address}</span>
        </div>
      </div>
    </footer>
  );
}
