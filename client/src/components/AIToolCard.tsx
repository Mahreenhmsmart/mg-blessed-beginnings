import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { AITool } from '@/types';
import { Check, ArrowRight } from 'lucide-react';
import { getEffectiveStatus } from '@/utils/toolStatusOverrides';

interface AIToolCardProps {
  tool: AITool;
  className?: string;
}

/** Static thumbnail images keyed by exact tool name. */
const TOOL_IMAGES: Record<string, string> = {
  'AI Video Generator': 'https://drive.google.com/thumbnail?id=1YpGlb_nugUp_3-GYkIWyybOuqwYISouq&sz=w1920',
  'Brand Campaign Studio': 'https://drive.google.com/thumbnail?id=1E8VwZBlfz2tqd_bm2p3O8DY7uhJ3w_7Y&sz=w1920',
  'Branding Assistant': 'https://drive.google.com/thumbnail?id=171KO7Pn5YaU4pcuGwg5vyvSYBeNbIlkp&sz=w1920',
  'Competitor Analyzer': 'https://drive.google.com/thumbnail?id=13WQbzyj9Ak2GWYo1khgEbC4DnKXIjwJH&sz=w1920',
  'Hashtag Generator': 'https://drive.google.com/thumbnail?id=1P6W8B1M3bEt2LigfVrikZ-CDsxGmmscu&sz=w1920',
  'Keyword Research Tool': 'https://drive.google.com/thumbnail?id=1Mev8FX2cDFOEqLqdZWwHCByMh1k1Q-Mc&sz=w1920',
  'Listing Health Score': 'https://drive.google.com/thumbnail?id=1veq-WanQstJU0P39P4f1kdDm2lxIv-38&sz=w1920',
  'Listing Optimizer': 'https://drive.google.com/thumbnail?id=1XP4sOhfZkVaa4zRV0JrqVU2_Ktcz7pmz&sz=w1920',
  'Product Description Generator': 'https://drive.google.com/thumbnail?id=1DHnaw_YJmaeC_a86sb_ohySPA_T4b6Lb&sz=w1920',
  'Profit Calculator': 'https://drive.google.com/thumbnail?id=1daUTE2rgq9C7lJMJLtsaEDCXyOD_ruxw&sz=w1920',
  'Prompt Library': 'https://drive.google.com/thumbnail?id=1oixTHNGN2srEKnnvljWkCC7nZ1bbUIUL&sz=w1920',
  'Review Response Writer': 'https://drive.google.com/thumbnail?id=1w4zj4NCna0kLhMl13uhwEm3uXwgDOm5d&sz=w1920',
  'SEO & Backlink Studio': 'https://drive.google.com/thumbnail?id=1WZs2lWSeoQ8O4C4mwkGDSjHkPrzOPu-R&sz=w1920',
  'SEO Title Optimizer': 'https://drive.google.com/thumbnail?id=1ceEltnnVCMfWWQJ8wzK2U0sDNQuSHHeM&sz=w1920',
  'Social Media Studio': 'https://drive.google.com/thumbnail?id=1b7ty8OcuLoM8iqJSSWg1kPjtjN9Vnb1V&sz=w1920',
  'WhatsApp Business Generator': 'https://drive.google.com/thumbnail?id=148g0RO9938gD__bxYf97cBrrPNcU3ucs&sz=w1920',
  'Bulk Listing Generator': 'https://drive.google.com/thumbnail?id=1DzTwiHnzWbhLcQcuK_xNuYonu1-5Jb0U&sz=w1920',
  'Product Research Assistant': 'https://drive.google.com/thumbnail?id=1Pcy-evjNJYgvXPCs0zwpii9AAQFTt9g2&sz=w1920',
  'Store Audit': 'https://drive.google.com/thumbnail?id=15aHY-OjQj5Lwyz7eX4flWRXCWK3F48AK&sz=w1920',
  'Free AI Tokens Hub': 'https://drive.google.com/thumbnail?id=1KOV_j24L2YFMiIMxgFUf1csCygp0SHc2&sz=w1920',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  live: { label: 'Live', className: 'bg-cyan/10 text-cyan border-cyan/20' },
  beta: { label: 'Beta', className: 'bg-warning/10 text-warning border-warning/20' },
  demo: { label: 'AI-Powered Insights', className: 'bg-accent/10 text-accent border-accent/20' },
  coming_soon: { label: 'Coming Soon', className: 'bg-muted/50 text-muted-foreground border-border' },
};

export default function AIToolCard({ tool, className }: AIToolCardProps) {
  const features = Array.isArray(tool.features) ? tool.features : [];
  
  // Use shared override logic for consistent status across all views
  const effectiveStatus = getEffectiveStatus(tool.slug, tool.status);
  const statusInfo = statusConfig[effectiveStatus] || statusConfig.live;

  // Resolve image: prefer explicit field, fall back to name-keyed map
  const imageUrl = tool.image || TOOL_IMAGES[tool.name];

  return (
    <Card
      className={cn(
        'flex flex-col h-full gap-0 overflow-hidden',
        className,
      )}
      style={{
        background: '#1B2031',
        border: '1px solid #35415D',
        borderRadius: '22px',
      }}
      data-icod-id="src_components_aitoolcard_tsx_4b2a">
      {/* Full-width thumbnail image */}
      {imageUrl && (
        <img
          className="tool-image"
          src={imageUrl}
          alt={tool.name}
          loading="lazy"
          data-icod-id="src_components_aitoolcard_tsx_image" />
      )}
      {/* Content area */}
      <div
        className="flex flex-col flex-1"
        style={{ padding: '20px 28px' }}
        data-icod-id="src_components_aitoolcard_tsx_content">
        {/* Title & Badges */}
        <div
          className="flex flex-wrap items-start justify-between mb-2 gap-3"
          data-icod-id="src_components_aitoolcard_tsx_5947">
          <h3
            className="text-2xl font-bold text-foreground font-heading leading-snug tracking-tight min-w-0"
            data-icod-id="src_components_aitoolcard_tsx_9b24">{tool.name}</h3>
          <div
            className="flex flex-wrap items-center gap-1.5 shrink-0"
            data-icod-id="src_components_aitoolcard_tsx_e12a">
            {tool.isFree && <Badge variant="free" data-icod-id="src_components_aitoolcard_tsx_f3cd">Free Forever</Badge>}
            <span
              className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border whitespace-nowrap shrink-0', statusInfo.className)}
              data-icod-id="src_components_aitoolcard_tsx_f70b">
              {statusInfo.label}
            </span>
          </div>
        </div>
        {/* Category */}
        <span
          className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4"
          data-icod-id="src_components_aitoolcard_tsx_c151">{tool.category}</span>
        {/* Description */}
        <p
          className="text-base text-muted-foreground leading-relaxed mb-5 flex-1 font-medium"
          data-icod-id="src_components_aitoolcard_tsx_8c0b">{tool.description}</p>
        {/* Features */}
        {features.length > 0 && (
          <ul
            className="space-y-2.5 mb-7"
            data-icod-id="src_components_aitoolcard_tsx_d5f8">
            {features.slice(0, 3).map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-base text-muted-foreground font-medium"
                data-icod-id={`src_components_aitoolcard_tsx_084b_${index}`}>
                <Check
                  className="h-5 w-5 mt-0.5 text-primary flex-shrink-0"
                  data-icod-id={`src_components_aitoolcard_tsx_37b4_${index}`} />
                <span className="leading-snug" data-icod-id={`src_components_aitoolcard_tsx_67a7_${index}`}>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        {/* CTA - Links to detail page */}
        <div
          className="mt-auto pt-6 border-t border-border"
          data-icod-id="src_components_aitoolcard_tsx_b245">
          {effectiveStatus === 'coming_soon' ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full border-border text-muted-foreground cursor-not-allowed opacity-60 font-bold"
              disabled
              data-icod-id="src_components_aitoolcard_tsx_comingsoon_btn">
              Coming Soon
            </Button>
          ) : (
            <Link
              to={tool.toolUrl || `/tools/${tool.slug || ''}`}
              className="block"
              data-icod-id="src_components_aitoolcard_tsx_detail_link">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-primary/40 text-primary hover:bg-primary/15 hover:border-primary/60 font-bold"
                data-icod-id="src_components_aitoolcard_tsx_408a">
                Learn More
                <ArrowRight
                  className="h-5 w-5 ml-2"
                  data-icod-id="src_components_aitoolcard_tsx_arrow_icon" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
