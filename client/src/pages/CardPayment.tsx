import { Link } from 'react-router-dom';
import { CreditCard, ShoppingBag, ExternalLink } from 'lucide-react';
import { Alert, Button, Card } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import LocalPaymentMethods from '@/components/LocalPaymentMethods';
import { PAGE_META } from '@/seo';

const cardPaymentMeta = PAGE_META['/card-payment'];

const PRODUCT = {
  title: '30 Pinterest Pin Templates for Modest Fashion Bloggers',
  description:
    '30 ready-to-pin Pinterest designs (9:16) for modest fashion bloggers — winter abayas, hijab styling, office looks, cozy knits, date nights, plus seller favourites like AI tools, Etsy tips and hashtag guides. Instant download as a ZIP file.',
  price: '$15 one-time',
  buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/30-pinterest-pin-templates-modest-fashion',
};

export default function CardPayment() {
  return (
    <>
      <SEOHead
        title={cardPaymentMeta.title}
        description={cardPaymentMeta.description}
        canonicalUrl={cardPaymentMeta.canonical}
        noindex={cardPaymentMeta.noindex}
        data-icod-id="src_pages_cardpayment_tsx_a0d9" />

      {/* Digital Products Section */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_cardpayment_tsx_digital_products_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-icod-id="src_pages_cardpayment_tsx_digital_container">
          {/* Section header */}
          <div className="text-center mb-10" data-icod-id="src_pages_cardpayment_tsx_digital_header">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
              data-icod-id="src_pages_cardpayment_tsx_digital_badge">
              <ShoppingBag
                className="h-4 w-4 text-primary"
                data-icod-id="src_pages_cardpayment_tsx_digital_icon" />
              <span
                className="text-sm font-semibold text-primary tracking-wide uppercase"
                data-icod-id="src_pages_cardpayment_tsx_digital_label">
                Digital Products
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading"
              data-icod-id="src_pages_cardpayment_tsx_digital_title">
              Shop Digital Products
            </h1>
            <p
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              data-icod-id="src_pages_cardpayment_tsx_digital_subtitle">
              Ready-to-use digital products from MG Blessed Beginnings — buy on Gumroad, download instantly.
            </p>
          </div>

          {/* Product card */}
          <Card
            hoverLift={false}
            className="overflow-hidden border-border/80 shadow-[0_8px_32px_rgba(var(--primary),0.1)]"
            data-icod-id="src_pages_cardpayment_tsx_product_card">
            <div className="p-8 md:p-10" data-icod-id="src_pages_cardpayment_tsx_product_content">
              {/* Price badge */}
              <div className="flex justify-between items-start mb-6" data-icod-id="src_pages_cardpayment_tsx_price_row">
                <div
                  className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2"
                  data-icod-id="src_pages_cardpayment_tsx_price_badge">
                  <span
                    className="text-xl font-bold text-accent"
                    data-icod-id="src_pages_cardpayment_tsx_price_value">
                    {PRODUCT.price}
                  </span>
                </div>
              </div>

              {/* Product details */}
              <h2
                className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cardpayment_tsx_product_title">
                {PRODUCT.title}
              </h2>
              <p
                className="text-muted-foreground leading-relaxed mb-8 text-base md:text-lg"
                data-icod-id="src_pages_cardpayment_tsx_product_description">
                {PRODUCT.description}
              </p>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3" data-icod-id="src_pages_cardpayment_tsx_cta">
                <a
                  href={PRODUCT.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-icod-id="src_pages_cardpayment_tsx_gumroad_link">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto min-w-[280px]"
                    data-icod-id="src_pages_cardpayment_tsx_buy_button">
                    Buy on Gumroad — $15
                    <ExternalLink
                      className="h-4 w-4 ml-1"
                      data-icod-id="src_pages_cardpayment_tsx_external_icon" />
                  </Button>
                </a>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_cardpayment_tsx_secure_note">
                  Secure checkout and instant download on Gumroad.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Local Payment Methods Section - below digital products */}
      <LocalPaymentMethods data-icod-id="src_pages_cardpayment_tsx_local_payment_methods" />
    </>
  );
}
