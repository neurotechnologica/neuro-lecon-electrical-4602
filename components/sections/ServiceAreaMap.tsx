'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { ServiceAreaContent } from '@/types/content';

// Fix Leaflet default marker icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ServiceAreaMapProps {
  serviceArea: ServiceAreaContent;
}

export default function ServiceAreaMap({ serviceArea }: ServiceAreaMapProps) {
  const { heading, description, center, zoom, polygon } = serviceArea;
  const positions = polygon.map(({ lat, lng }) => [lat, lng] as [number, number]);

  return (
    <section id="service-area" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] mb-3">
            {heading}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-md" style={{ height: '420px' }}>
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polygon
              positions={positions}
              pathOptions={{
                color: 'var(--color-primary)',
                fillColor: 'var(--color-accent)',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
