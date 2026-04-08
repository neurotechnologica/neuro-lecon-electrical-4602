interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Renders a <script type="application/ld+json"> tag with serialised JSON-LD data. */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
