import { Card, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { Service } from '@/types';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Tag,
  Palette,
  Share2,
  Search,
  Check,
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  className?: string;
  compact?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag,
  Tag,
  Palette,
  Share2,
  Search,
};

export default function ServiceCard({ service, className, compact = false }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon] || ShoppingBag;

  return (
    <Card
      className={cn('flex flex-col h-full p-8 gap-2', className)}
      data-icod-id="src_components_servicecard_tsx_eb77">
      {/* Icon in soft purple circle */}
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-primary bg-secondary"
        data-icod-id="src_components_servicecard_tsx_0514">
        <IconComponent className="h-7 w-7" data-icod-id="src_components_servicecard_tsx_013a" />
      </div>
      {/* Title */}
      <h3
        className="text-2xl font-bold text-foreground mb-3 font-heading leading-snug tracking-tight"
        data-icod-id="src_components_servicecard_tsx_b683">{service.title}</h3>
      {/* Description */}
      <p
        className="text-base text-muted-foreground mb-5 flex-1 leading-relaxed font-medium"
        data-icod-id="src_components_servicecard_tsx_66ce">{service.description}</p>
      {/* Features (only if not compact) */}
      {!compact && service.features.length > 0 && (
        <ul
          className="space-y-2.5 mb-7"
          data-icod-id="src_components_servicecard_tsx_5de3">
          {service.features.slice(0, 4).map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-base text-muted-foreground font-medium"
              data-icod-id={`src_components_servicecard_tsx_421d_${index}`}>
              <Check
                className="h-5 w-5 mt-0.5 text-primary flex-shrink-0"
                data-icod-id={`src_components_servicecard_tsx_eb18_${index}`} />
              <span className="leading-snug" data-icod-id={`src_components_servicecard_tsx_f5e3_${index}`}>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      {/* Price and Duration */}
      <div
        className="mt-auto pt-6 border-t border-border"
        data-icod-id="src_components_servicecard_tsx_806a">
        <div
          className="flex items-center justify-between mb-5"
          data-icod-id="src_components_servicecard_tsx_0e81">
          <span
            className="text-xl font-extrabold text-foreground"
            data-icod-id="src_components_servicecard_tsx_fb6d">{service.price || 'Get a Quote'}</span>
          {service.duration && service.duration !== 'Tiered pricing' && (
            <span
              className="text-sm font-bold text-muted-foreground uppercase tracking-wider"
              data-icod-id="src_components_servicecard_tsx_f340">{service.duration}</span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/book?service=${encodeURIComponent(service.title)}`}
          className="block"
          data-icod-id="src_components_servicecard_tsx_bc58">
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold"
            data-icod-id="src_components_servicecard_tsx_b727">
            Get a Quote
          </Button>
        </Link>
      </div>
    </Card>
  );
}
