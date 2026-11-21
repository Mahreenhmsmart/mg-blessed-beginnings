import { Button, Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import LocalPaymentMethods from '@/components/LocalPaymentMethods';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { useSeo } from '@/components/Seo';

interface ShopProduct {
  title: string;
  price: string;
  buyUrl: string;
  image: string;
}

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    title: 'Pinterest Pin Template Pack',
    price: '$15',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/30-pinterest-pin-templates-modest-fashion',
    image: 'https://drive.google.com/thumbnail?id=188kqlpsv7tzvnmc-tU3pYzveCyTnKVze&sz=w1920',
  },
  {
    title: 'Winter Abaya Guide',
    price: '$10',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/22-winter-abaya-outfits-guide',
    image: 'https://drive.google.com/thumbnail?id=17lRNiPnyFVrcnRz3QIxTX8RO_LkDVJ93&sz=w1920',
  },
  {
    title: '50 AI Prompts for Pinterest Creators',
    price: '$15',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/ohjnua',
    image: 'https://drive.google.com/thumbnail?id=1K07-82tKDCpSoRyAqSBiPTo8ipwAwvT8&sz=w1920',
  },
  {
    title: 'Pinterest Content Calendar — Notion Template',
    price: '$25',
    buyUrl: 'https://mgblessedbeginnings.gumroad.com/l/ceeoa',
    image: 'https://drive.google.com/thumbnail?id=1hyXFciYsQUiiG3HDa20-zGVbOjvXyhqh&sz=w1920',
  },
];

export default function Shop() {
  useSeo(
    'Shop | MG Blessed Beginnings',
    'Digital products for online sellers — Pinterest templates, abaya guide, AI prompts and content calendar.',
  );
  return (
    <div
      className="min-h-screen bg-background"
      data-icod-id="src_pages_shop_tsx_d3ff">
      {/* Hero / Section Header */}
      <section
        className="py-20 md:py-28 bg-background relative overflow-hidden"
        data-icod-id="src_pages_shop_tsx_a5bc">
        {/* Background gradient accents */}
        <div
          className="absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_shop_tsx_97d6" />
        <div
          className="absolute -right-40 bottom-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_shop_tsx_2f05" />

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          data-icod-id="src_pages_shop_tsx_9803">
          <div
            className="text-center mb-12 md:mb-16"
            data-icod-id="src_pages_shop_tsx_9118">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
              data-icod-id="src_pages_shop_tsx_2b70">
              <ShoppingBag className="h-4 w-4 text-primary" data-icod-id="src_pages_shop_tsx_b2d6" />
              <span
                className="text-sm font-semibold text-primary tracking-wide uppercase"
                data-icod-id="src_pages_shop_tsx_01a9">
                Digital Products
              </span>
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 font-heading tracking-tight"
              data-icod-id="src_pages_shop_tsx_0926">
              Shop{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
                data-icod-id="src_pages_shop_tsx_8a87">
                Digital Products
              </span>
            </h1>
            <p
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              data-icod-id="src_pages_shop_tsx_6f5e">
              Ready-to-use digital resources for marketers and entrepreneurs — buy on Gumroad, download instantly.
            </p>
          </div>

          {/* Product Grid */}
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
            data-icod-id="src_pages_shop_tsx_c870">
            {SHOP_PRODUCTS.map((product) => (
              <Card
                key={product.title}
                hoverLift={false}
                className="flex flex-col overflow-hidden border-border/80 shadow-[0_8px_32px_rgba(var(--primary),0.1)]"
                data-icod-id={`src_pages_shop_tsx_09b7_${product.title}`}>
                <img
                  className="shop-image"
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  data-icod-id={`src_pages_shop_tsx_9daf_${product.title}`} />
                <div
                  className="flex flex-col flex-1 p-6 md:p-8"
                  data-icod-id={`src_pages_shop_tsx_833a_${product.title}`}>
                  {/* Price badge */}
                  <div
                    className="mb-4"
                    data-icod-id={`src_pages_shop_tsx_d45b_${product.title}`}>
                    <div
                      className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2"
                      data-icod-id={`src_pages_shop_tsx_1d8b_${product.title}`}>
                      <span
                        className="text-lg font-bold text-accent"
                        data-icod-id={`src_pages_shop_tsx_2ce3_${product.title}`}>
                        {product.price}
                      </span>
                    </div>
                  </div>

                  {/* Product title */}
                  <h3
                    className="text-xl md:text-2xl font-bold text-foreground mb-4 font-heading flex-1"
                    data-icod-id={`src_pages_shop_tsx_6f41_${product.title}`}>
                    {product.title}
                  </h3>

                  {/* CTA */}
                  <div
                    className="mt-auto flex flex-col items-center gap-3 pt-4"
                    data-icod-id={`src_pages_shop_tsx_ade8_${product.title}`}>
                    <a
                      href={product.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                      data-icod-id={`src_pages_shop_tsx_ac9d_${product.title}`}>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        data-icod-id={`src_pages_shop_tsx_21a0_${product.title}`}>
                        Buy on Gumroad
                        <ExternalLink
                          className="h-4 w-4 ml-1"
                          data-icod-id={`src_pages_shop_tsx_14b7_${product.title}`} />
                      </Button>
                    </a>
                    <p
                      className="text-xs text-muted-foreground"
                      data-icod-id={`src_pages_shop_tsx_f857_${product.title}`}>
                      Secure checkout &amp; instant download
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Local Payment Methods */}
      <LocalPaymentMethods data-icod-id="src_pages_shop_tsx_cd1e" />
    </div>
  );
}
