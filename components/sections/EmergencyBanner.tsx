import { EmergencyBannerContent, MetaContent } from '@/types/content';

interface EmergencyBannerProps {
  emergencyBanner: EmergencyBannerContent;
  phone: MetaContent['phone'];
}

export default function EmergencyBanner({ emergencyBanner, phone }: EmergencyBannerProps) {
  if (!emergencyBanner.enabled) return null;

  return (
    <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium">
      <span>{emergencyBanner.message}</span>
      {' '}
      <a
        href={`tel:${phone}`}
        className="underline font-bold hover:text-red-100 transition-colors"
      >
        {phone}
      </a>
    </div>
  );
}
