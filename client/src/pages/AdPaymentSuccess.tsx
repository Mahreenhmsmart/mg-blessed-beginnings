import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button, Card } from '@/components/ui';
import { ArrowRight, Info } from 'lucide-react';
import { PAGE_META } from '@/seo';

const adPaySuccessMeta = PAGE_META['/ad-payment/success'];

export default function AdPaymentSuccess() {
  return (
    <>
      <SEOHead
        title={adPaySuccessMeta.title}
        description={adPaySuccessMeta.description}
        canonicalUrl={adPaySuccessMeta.canonical}
        noindex={adPaySuccessMeta.noindex}
        data-icod-id="src_pages_adpaymentsuccess_tsx_66e1" />
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-20" data-icod-id="src_pages_adpaymentsuccess_tsx_94e4">
        <Card className="relative max-w-lg w-full p-10 text-center" data-icod-id="src_pages_adpaymentsuccess_tsx_07b6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10" data-icod-id="src_pages_adpaymentsuccess_tsx_2a7c">
            <Info className="h-10 w-10 text-primary" data-icod-id="src_pages_adpaymentsuccess_tsx_a453" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-heading mb-3" data-icod-id="src_pages_adpaymentsuccess_tsx_1bd1">
            Ad Payment Information
          </h1>
          <p className="text-lg text-muted-foreground mb-8" data-icod-id="src_pages_adpaymentsuccess_tsx_d101">
            Ad payment processing is not currently configured. If you need to purchase an ad placement, please contact support.
          </p>
          <div className="flex flex-col gap-3" data-icod-id="src_pages_adpaymentsuccess_tsx_4ac3">
            <Link to="/" data-icod-id="src_pages_adpaymentsuccess_tsx_b88c">
              <Button variant="primary" size="lg" className="w-full" data-icod-id="src_pages_adpaymentsuccess_tsx_3d1e">
                Back to Home
                <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_adpaymentsuccess_tsx_bab9" />
              </Button>
            </Link>
            <Link to="/advertisement" data-icod-id="src_pages_adpaymentsuccess_tsx_ae18">
              <Button variant="ghost" className="w-full" data-icod-id="src_pages_adpaymentsuccess_tsx_a092">View Ad Options</Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
