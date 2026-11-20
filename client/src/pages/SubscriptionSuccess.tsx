import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button, Card } from '@/components/ui';
import { ArrowRight, Info } from 'lucide-react';
import { PAGE_META } from '@/seo';

const subSuccessMeta = PAGE_META['/subscription/success'];

export default function SubscriptionSuccess() {
  return (
    <>
      <SEOHead
        title={subSuccessMeta.title}
        description={subSuccessMeta.description}
        canonicalUrl={subSuccessMeta.canonical}
        noindex={subSuccessMeta.noindex}
        data-icod-id="src_pages_subscriptionsuccess_tsx_661c" />
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-20" data-icod-id="src_pages_subscriptionsuccess_tsx_9628">
        <Card className="relative max-w-lg w-full p-10 text-center" data-icod-id="src_pages_subscriptionsuccess_tsx_9af9">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10" data-icod-id="src_pages_subscriptionsuccess_tsx_1fa2">
            <Info className="h-10 w-10 text-primary" data-icod-id="src_pages_subscriptionsuccess_tsx_90c9" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-heading mb-3" data-icod-id="src_pages_subscriptionsuccess_tsx_1c94">
            Subscription Information
          </h1>
          <p className="text-lg text-muted-foreground mb-8" data-icod-id="src_pages_subscriptionsuccess_tsx_afd8">
            Payment processing is not currently configured. If you believe you have an active subscription, please contact support.
          </p>
          <div className="flex flex-col gap-3" data-icod-id="src_pages_subscriptionsuccess_tsx_b844">
            <Link to="/" data-icod-id="src_pages_subscriptionsuccess_tsx_b566">
              <Button variant="primary" size="lg" className="w-full" data-icod-id="src_pages_subscriptionsuccess_tsx_8730">
                Go Home
                <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_subscriptionsuccess_tsx_8327" />
              </Button>
            </Link>
            <Link to="/" data-icod-id="src_pages_subscriptionsuccess_tsx_d8a1">
              <Button variant="ghost" className="w-full" data-icod-id="src_pages_subscriptionsuccess_tsx_0da7">Go Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
