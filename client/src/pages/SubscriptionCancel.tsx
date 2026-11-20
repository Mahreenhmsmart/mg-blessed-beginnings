import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button, Card } from '@/components/ui';
import { XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { PAGE_META } from '@/seo';

const subCancelMeta = PAGE_META['/subscription/cancel'];

export default function SubscriptionCancel() {
  return (
    <>
      <SEOHead
        title={subCancelMeta.title}
        description={subCancelMeta.description}
        canonicalUrl={subCancelMeta.canonical}
        noindex={subCancelMeta.noindex}
        data-icod-id="src_pages_subscriptioncancel_tsx_202c" />
      <div
        className="flex min-h-[70vh] items-center justify-center px-4 py-20"
        data-icod-id="src_pages_subscriptioncancel_tsx_7e45">
        {/* Ambient glow */}
        <div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-destructive/5 blur-[120px] pointer-events-none"
          data-icod-id="src_pages_subscriptioncancel_tsx_8d98" />

        <Card
          className="relative max-w-md w-full p-10 text-center"
          data-icod-id="src_pages_subscriptioncancel_tsx_91da">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_40px_rgba(var(--destructive),0.2)]"
            style={{ background: 'linear-gradient(135deg, rgba(var(--destructive), 0.15) 0%, rgba(var(--destructive), 0.05) 100%)' }}
            data-icod-id="src_pages_subscriptioncancel_tsx_8ffa">
            <XCircle
              className="h-10 w-10 text-destructive"
              data-icod-id="src_pages_subscriptioncancel_tsx_a1b7" />
          </div>

          <h1
            className="text-3xl font-bold text-foreground font-heading mb-3"
            data-icod-id="src_pages_subscriptioncancel_tsx_1bfc">
            Payment Cancelled
          </h1>
          <p
            className="text-muted-foreground mb-8"
            data-icod-id="src_pages_subscriptioncancel_tsx_be08">
            No charge was made. You can try again whenever you're ready. Your account remains on the free plan.
          </p>

          <div
            className="flex flex-col gap-3"
            data-icod-id="src_pages_subscriptioncancel_tsx_0c11">
            <Link to="/" data-icod-id="src_pages_subscriptioncancel_tsx_9cdb">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                data-icod-id="src_pages_subscriptioncancel_tsx_36c7">
                <RotateCcw
                  className="h-4 w-4 mr-2"
                  data-icod-id="src_pages_subscriptioncancel_tsx_a4c5" />
                Try Again
              </Button>
            </Link>
            <Link to="/" data-icod-id="src_pages_subscriptioncancel_tsx_5e45">
              <Button
                variant="ghost"
                className="w-full"
                data-icod-id="src_pages_subscriptioncancel_tsx_95eb">
                Go Home
                <ArrowRight
                  className="h-4 w-4 ml-2"
                  data-icod-id="src_pages_subscriptioncancel_tsx_f013" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
