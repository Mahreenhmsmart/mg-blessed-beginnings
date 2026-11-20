import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button, Card } from '@/components/ui';
import { XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { PAGE_META } from '@/seo';

const adPayCancelMeta = PAGE_META['/ad-payment/cancel'];

export default function AdPaymentCancel() {
  return (
    <>
      <SEOHead
        title={adPayCancelMeta.title}
        description={adPayCancelMeta.description}
        canonicalUrl={adPayCancelMeta.canonical}
        noindex={adPayCancelMeta.noindex}
        data-icod-id="src_pages_adpaymentcancel_tsx_289e" />
      <div
        className="flex min-h-[70vh] items-center justify-center px-4 py-20"
        data-icod-id="src_pages_adpaymentcancel_tsx_4412">
        {/* Ambient glow */}
        <div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-destructive/5 blur-[120px] pointer-events-none"
          data-icod-id="src_pages_adpaymentcancel_tsx_8890" />

        <Card
          className="relative max-w-md w-full p-10 text-center"
          data-icod-id="src_pages_adpaymentcancel_tsx_f29a">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_40px_rgba(var(--destructive),0.2)]"
            style={{ background: 'linear-gradient(135deg, rgba(var(--destructive), 0.15) 0%, rgba(var(--destructive), 0.05) 100%)' }}
            data-icod-id="src_pages_adpaymentcancel_tsx_0411">
            <XCircle
              className="h-10 w-10 text-destructive"
              data-icod-id="src_pages_adpaymentcancel_tsx_44b0" />
          </div>

          <h1
            className="text-3xl font-bold text-foreground font-heading mb-3"
            data-icod-id="src_pages_adpaymentcancel_tsx_b1e6">
            Payment Cancelled
          </h1>
          <p
            className="text-muted-foreground mb-8"
            data-icod-id="src_pages_adpaymentcancel_tsx_1f12">
            No charge was made. You can try purchasing an ad placement again whenever you're ready.
          </p>

          <div
            className="flex flex-col gap-3"
            data-icod-id="src_pages_adpaymentcancel_tsx_d69b">
            <Link to="/advertisement" data-icod-id="src_pages_adpaymentcancel_tsx_db56">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                data-icod-id="src_pages_adpaymentcancel_tsx_2d56">
                <RotateCcw
                  className="h-4 w-4 mr-2"
                  data-icod-id="src_pages_adpaymentcancel_tsx_dbb9" />
                Try Again
              </Button>
            </Link>
            <Link to="/" data-icod-id="src_pages_adpaymentcancel_tsx_84e8">
              <Button
                variant="ghost"
                className="w-full"
                data-icod-id="src_pages_adpaymentcancel_tsx_9b5e">
                Go Home
                <ArrowRight
                  className="h-4 w-4 ml-2"
                  data-icod-id="src_pages_adpaymentcancel_tsx_347d" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
