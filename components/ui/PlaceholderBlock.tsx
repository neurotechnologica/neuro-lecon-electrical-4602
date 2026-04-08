interface PlaceholderBlockProps {
  description: string;
  value?: string | null;
}

/**
 * Renders a styled placeholder block for null or [PLACEHOLDER-prefixed field values.
 * Only active in non-production environments or when the value is null/placeholder.
 */
export default function PlaceholderBlock({ description, value }: PlaceholderBlockProps) {
  const isPlaceholderValue =
    value === null || value === undefined || (typeof value === 'string' && value.startsWith('[PLACEHOLDER'));

  const isActive = process.env.NODE_ENV !== 'production' || isPlaceholderValue;

  if (!isActive) return null;

  return (
    <div
      style={{
        backgroundColor: '#FEF9C3',
        border: '2px dashed #CA8A04',
        borderRadius: '6px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Pencil icon */}
      <span aria-hidden="true" style={{ fontSize: '1rem', flexShrink: 0 }}>
        ✏️
      </span>
      <p style={{ margin: 0, fontStyle: 'italic', color: '#92400E', fontSize: '0.875rem' }}>
        {description}
      </p>
    </div>
  );
}
