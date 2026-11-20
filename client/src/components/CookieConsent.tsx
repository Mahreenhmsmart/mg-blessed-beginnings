import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { X, Cookie } from 'lucide-react';
import { cn } from '@/utils/cn';

const COOKIE_CONSENT_KEY = 'mg-cookie-consent';

type ConsentStatus = 'accepted' | 'rejected' | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus;
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setConsent('accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setConsent('rejected');
    setIsVisible(false);
  };

  if (consent !== null || !isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50',
        'animate-fade-in-up'
      )}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      data-icod-id="src_components_cookieconsent_tsx_root">
      <div
        className="bg-card border border-border/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 md:p-6"
        data-icod-id="src_components_cookieconsent_tsx_card">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4" data-icod-id="src_components_cookieconsent_tsx_header">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            data-icod-id="src_components_cookieconsent_tsx_icon_wrap">
            <Cookie className="h-5 w-5" data-icod-id="src_components_cookieconsent_tsx_icon" />
          </div>
          <div className="flex-1" data-icod-id="src_components_cookieconsent_tsx_text_wrap">
            <h3
              id="cookie-consent-title"
              className="font-semibold text-foreground mb-1"
              data-icod-id="src_components_cookieconsent_tsx_title">
              Cookie Consent
            </h3>
            <p
              id="cookie-consent-desc"
              className="text-sm text-muted-foreground leading-relaxed"
              data-icod-id="src_components_cookieconsent_tsx_desc">
              We use cookies to enhance your experience and analyze site traffic. By continuing to visit this site you agree to our use of cookies.{' '}
              <Link
                to="/cookie-policy"
                className="text-primary hover:underline font-medium"
                data-icod-id="src_components_cookieconsent_tsx_policy_link">
                Learn more
              </Link>
            </p>
          </div>
          <button
            onClick={handleReject}
            className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close cookie consent"
            data-icod-id="src_components_cookieconsent_tsx_close">
            <X className="h-4 w-4" data-icod-id="src_components_cookieconsent_tsx_close_icon" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3" data-icod-id="src_components_cookieconsent_tsx_buttons">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="flex-1"
            data-icod-id="src_components_cookieconsent_tsx_accept">
            Accept All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="flex-1"
            data-icod-id="src_components_cookieconsent_tsx_reject">
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
