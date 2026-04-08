'use client';

import { MaintenancePlansContent } from '@/types/content';
import { useBooking } from '@/components/booking/BookingContext';

interface MaintenancePlansProps {
  maintenancePlans: MaintenancePlansContent;
}

export default function MaintenancePlans({ maintenancePlans }: MaintenancePlansProps) {
  const { openModal } = useBooking();

  if (!maintenancePlans.enabled) return null;

  return (
    <section id="maintenance-plans" className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="section-label">Plans</span>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">
            {maintenancePlans.heading}
          </h2>
          <p className="text-gray-500 text-lg">Simple, transparent pricing. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {maintenancePlans.plans.map((plan, index) => {
            const isPro = index === maintenancePlans.plans.length - 1;
            return (
              <div
                key={index}
                className={`relative rounded-2xl p-7 flex flex-col gap-5 ${
                  isPro
                    ? 'bg-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-primary)]/30'
                    : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${isPro ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${isPro ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${isPro ? 'text-white/60' : 'text-gray-400'}`}>{plan.billingPeriod}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className={`flex items-start gap-2 text-sm ${isPro ? 'text-white/80' : 'text-gray-600'}`}>
                      <span className={`mt-0.5 font-bold ${isPro ? 'text-white' : 'text-[var(--color-accent)]'}`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openModal(plan.name)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isPro
                      ? 'bg-white text-[var(--color-primary)] hover:bg-white/90'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)]'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
