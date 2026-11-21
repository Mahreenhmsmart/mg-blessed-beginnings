import { Button, Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ShoppingBag, ExternalLink, ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import LocalPaymentMethods from '@/components/LocalPaymentMethods';
import { Link } from 'react-router-dom';

interface ShopDigitalProductsProps {
  className?: string;
}

interface DigitalProduct {
  title: string;
  description: string;
  price: string;
  buyUrl: string;
  image: string;
}

const PRODUCTS: DigitalProduct[] = [
  {
    title: 'Pinterest Pin Template Pack',
    description:
      'Ready-to-use Pinterest pin templates designed for content creators and bloggers. Instant download.',
    price: '$15',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/30-pinterest-pin-templates-modest-fashion',
    image: 'https://drive.google.com/thumbnail?id=188kqlpsv7tzvnmc-tU3pYzveCyTnKVze&sz=w1920',
  },
  {
    title: 'Winter Abaya Guide',
    description:
      'A comprehensive guide to styling winter abayas with modest fashion tips, layering ideas, and outfit inspiration.',
    price: '$10',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/22-winter-abaya-outfits-guide',
    image: 'https://drive.google.com/thumbnail?id=17lRNiPnyFVrcnRz3QIxTX8RO_LkDVJ93&sz=w1920',
  },
  {
    title: '50 AI Prompts for Pinterest Creators',
    description:
      '50 carefully crafted AI prompts to help Pinterest creators generate pin ideas, descriptions, and content strategies faster.',
    price: '$15',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/ohjnua',
    image: 'https://drive.google.com/thumbnail?id=1K07-82tKDCpSoRyAqSBiPTo8ipwAwvT8&sz=w1920',
  },
  {
    title: 'Pinterest Content Calendar — Notion Template',
    description:
      'A fully organized Notion template for planning and scheduling your Pinterest content strategy. Stay consistent and grow your audience.',
    price: '$25',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/ceeoa',
    image: 'https://drive.google.com/thumbnail?id=1hyXFciYsQUiiG3HDa20-zGVbOjvXyhqh&sz=w1920',
  },
];

export default function ShopDigitalProducts({ className }: ShopDigitalProductsProps) {
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_shopdigitalproducts_tsx_section">
      {/* Background gradient accents */}
      <div
        className="absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_shopdigitalproducts_tsx_glow_left" />
      <div
        className="absolute -right-40 bottom-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_shopdigitalproducts_tsx_glow_right" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_shopdigitalproducts_tsx_container">
        {/* Section header */}
        <div
          className="text-center mb-12 md:mb-16"
          data-icod-id="src_components_homepage_shopdigitalproducts_tsx_header">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
            data-icod-id="src_components_homepage_shopdigitalproducts_tsx_badge">
            <ShoppingBag
              className="h-4 w-4 text-primary"
              data-icod-id="src_components_homepage_shopdigitalproducts_tsx_icon" />
            <span
              className="text-sm font-semibold text-primary tracking-wide uppercase"
              data-icod-id="src_components_homepage_shopdigitalproducts_tsx_label">
              Digital Products
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 font-heading tracking-tight"
            data-icod-id="src_components_homepage_shopdigitalproducts_tsx_title">
            Shop{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
              data-icod-id="src_components_homepage_shopdigitalproducts_tsx_gradient">
              Digital Products
            </span>
          </h2>
          <p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_components_homepage_shopdigitalproducts_tsx_subheading">
            Ready-to-use digital products from MG Blessed Beginnings — buy on Gumroad, download instantly.
          </p>
        </div>

        {/* Product cards grid */}
        <div
          ref={ref}
          className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_shopdigitalproducts_tsx_grid">
          {PRODUCTS.map((product) => (
            <Card
              key={product.title}
              hoverLift={false}
              className="flex flex-col overflow-hidden border-border/80 shadow-[0_8px_32px_rgba(var(--primary),0.1)]"
              data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_card_${product.title}`}>
              <img
                className="shop-image"
                src={product.image}
                alt={product.title}
                loading="lazy"
                data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_63fa_${product.title}`} />
              <div
                className="flex flex-col flex-1 p-6 md:p-8"
                data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_content_${product.title}`}>
                {/* Price badge */}
                <div
                  className="mb-4"
                  data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_price_row_${product.title}`}>
                  <div
                    className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2"
                    data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_price_badge_${product.title}`}>
                    <span
                      className="text-lg font-bold text-accent"
                      data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_price_value_${product.title}`}>
                      {product.price}
                    </span>
                  </div>
                </div>

                {/* Product title */}
                <h3
                  className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading flex-1"
                  data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_product_title_${product.title}`}>
                  {product.title}
                </h3>

                {/* CTA */}
                <div
                  className="mt-auto flex flex-col items-center gap-3 pt-4"
                  data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_cta_${product.title}`}>
                  <a
                    href={product.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                    data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_link_${product.title}`}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_button_${product.title}`}>
                      Buy on Gumroad
                      <ExternalLink
                        className="h-4 w-4 ml-1"
                        data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_external_icon_${product.title}`} />
                    </Button>
                  </a>
                  <p
                    className="text-xs text-muted-foreground"
                    data-icod-id={`src_components_homepage_shopdigitalproducts_tsx_note_${product.title}`}>
                    Secure checkout &amp; instant download
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View all products link */}
        <div
          className="text-center mt-10"
          data-icod-id="src_components_homepage_shopdigitalproducts_tsx_view_all">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            data-icod-id="src_components_homepage_shopdigitalproducts_tsx_view_all_link">
            View All Products
            <ArrowRight className="h-4 w-4" data-icod-id="src_components_homepage_shopdigitalproducts_tsx_view_all_icon" />
          </Link>
        </div>
      </div>
      {/* Local Payment Methods — How to Pay */}
      <LocalPaymentMethods data-icod-id="src_components_homepage_shopdigitalproducts_tsx_payment_methods" />
    </section>
  );
}
