import { useState, useRef, type FormEvent } from 'react';
import { Button, Input, Alert } from '@/components/ui';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const KIT_FORM_ACTION = 'https://app.kit.com/forms/10156924/subscriptions';

interface NewsletterSignupProps {
  className?: string;
  source?: string;
  variant?: 'default' | 'compact' | 'hero';
}

export default function NewsletterSignup({
  className,
  source = 'general',
  variant = 'default',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    // Submit via hidden iframe so the user stays on the page
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = KIT_FORM_ACTION;
    form.target = 'kit-newsletter-iframe';
    form.style.display = 'none';

    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email_address';
    emailInput.value = email.trim();
    form.appendChild(emailInput);

    // Kit uses this field name for the subscriber email
    const fieldsInput = document.createElement('input');
    fieldsInput.type = 'hidden';
    fieldsInput.name = 'fields[source]';
    fieldsInput.value = source;
    form.appendChild(fieldsInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Give Kit a moment to process, then show success
    setTimeout(() => {
      setStatus('success');
      setMessage('Thanks! Check your inbox for a confirmation.');
      setEmail('');
    }, 1500);
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn('space-y-3', className)}
        data-icod-id="src_components_newslettersignup_tsx_7833">
        {/* Hidden iframe target for Kit form submission */}
        <iframe
          ref={iframeRef}
          name="kit-newsletter-iframe"
          title="Newsletter signup"
          style={{ display: 'none' }}
          data-icod-id="src_components_newslettersignup_tsx_5555" />
        {status === 'success' ? (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: '#29ADA4' }}
            data-icod-id="src_components_newslettersignup_tsx_7cf1">
            <CheckCircle
              className="h-4 w-4"
              data-icod-id="src_components_newslettersignup_tsx_99dd" />
            <span
              style={{ color: '#111827' }}
              data-icod-id="src_components_newslettersignup_tsx_7710">{message}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2"
            data-icod-id="src_components_newslettersignup_tsx_722f">
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              className="flex-1 bg-white border-[#DDD6F3] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#7662C7] focus:ring-[#7662C7]"
              data-icod-id="src_components_newslettersignup_tsx_7111" />
            <Button
              type="submit"
              size="sm"
              loading={status === 'loading'}
              disabled={!email.trim()}
              className="bg-[#7662C7] hover:bg-[#6554B5] text-white border-none"
              data-icod-id="src_components_newslettersignup_tsx_309c">
              Subscribe
            </Button>
          </form>
        )}
        {status === 'error' && (
          <Alert variant="error" data-icod-id="src_components_newslettersignup_tsx_71c6">{message}</Alert>
        )}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={cn('text-center max-w-lg mx-auto', className)}
        data-icod-id="src_components_newslettersignup_tsx_5c41">
        {/* Hidden iframe target for Kit form submission */}
        <iframe
          ref={iframeRef}
          name="kit-newsletter-iframe"
          title="Newsletter signup"
          style={{ display: 'none' }}
          data-icod-id="src_components_newslettersignup_tsx_0c34" />
        {status === 'success' ? (
          <div
            className="p-6 rounded-2xl border animate-fade-in-up"
            style={{ backgroundColor: '#F5F2FF', borderColor: '#DDD6F3' }}
            data-icod-id="src_components_newslettersignup_tsx_a05a">
            <CheckCircle
              className="h-12 w-12 mx-auto mb-3"
              style={{ color: '#29ADA4' }}
              data-icod-id="src_components_newslettersignup_tsx_8c25" />
            <h3
              className="font-semibold mb-2"
              style={{ color: '#111827' }}
              data-icod-id="src_components_newslettersignup_tsx_d172">You're subscribed!</h3>
            <p
              style={{ color: '#4B5563' }}
              data-icod-id="src_components_newslettersignup_tsx_d434">{message}</p>
          </div>
        ) : (
          <>
            <h3
              className="text-2xl font-bold mb-3"
              style={{ color: '#7662C7' }}
              data-icod-id="src_components_newslettersignup_tsx_d121">
              Join Our Newsletter
            </h3>
            <p
              className="mb-6"
              style={{ color: '#4B5563' }}
              data-icod-id="src_components_newslettersignup_tsx_02f4">
              Get weekly e-commerce tips, AI tool updates, and exclusive strategies delivered to your inbox.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
              data-icod-id="src_components_newslettersignup_tsx_22c1">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                className="flex-1 bg-white border-[#DDD6F3] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#7662C7] focus:ring-[#7662C7]"
                data-icod-id="src_components_newslettersignup_tsx_4ff5" />
              <Button
                type="submit"
                loading={status === 'loading'}
                disabled={!email.trim()}
                className="bg-[#7662C7] hover:bg-[#6554B5] text-white border-none"
                data-icod-id="src_components_newslettersignup_tsx_22e0">
                Subscribe
                {!status || status === 'idle' ? <ArrowRight
                  className="h-4 w-4 ml-2"
                  data-icod-id="src_components_newslettersignup_tsx_75e7" /> : null}
              </Button>
            </form>
            {status === 'error' && (
              <Alert
                variant="error"
                className="mt-4"
                data-icod-id="src_components_newslettersignup_tsx_af94">{message}</Alert>
            )}
            <p
              className="text-xs mt-3"
              style={{ color: '#6B7280' }}
              data-icod-id="src_components_newslettersignup_tsx_dcf2">
              No spam, ever. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn('p-6 rounded-2xl border', className)}
      style={{ backgroundColor: '#FFFFFF', borderColor: '#DDD6F3' }}
      data-icod-id="src_components_newslettersignup_tsx_45b3">
      {/* Hidden iframe target for Kit form submission */}
      <iframe
        ref={iframeRef}
        name="kit-newsletter-iframe"
        title="Newsletter signup"
        style={{ display: 'none' }}
        data-icod-id="src_components_newslettersignup_tsx_9ab5" />
      <div
        className="flex items-start gap-4 mb-4"
        data-icod-id="src_components_newslettersignup_tsx_feab">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: '#EDE9FE', color: '#7662C7' }}
          data-icod-id="src_components_newslettersignup_tsx_867b">
          <Mail
            className="h-5 w-5"
            data-icod-id="src_components_newslettersignup_tsx_e5f0" />
        </div>
        <div data-icod-id="src_components_newslettersignup_tsx_0967">
          <h3
            className="font-semibold mb-1"
            style={{ color: '#7662C7' }}
            data-icod-id="src_components_newslettersignup_tsx_c822">Get free seller tips in your inbox</h3>
          <p
            className="text-sm"
            style={{ color: '#4B5563' }}
            data-icod-id="src_components_newslettersignup_tsx_3f37">
            Weekly e-commerce strategies, AI tool updates, and growth tips — straight to you.
          </p>
        </div>
      </div>
      {status === 'success' ? (
        <div
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{ backgroundColor: '#E6FAF8', color: '#29ADA4' }}
          data-icod-id="src_components_newslettersignup_tsx_2657">
          <CheckCircle
            className="h-5 w-5"
            data-icod-id="src_components_newslettersignup_tsx_43c7" />
          <span
            className="font-medium"
            style={{ color: '#111827' }}
            data-icod-id="src_components_newslettersignup_tsx_c6e3">{message}</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
          data-icod-id="src_components_newslettersignup_tsx_0329">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1 bg-white border-[#DDD6F3] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#7662C7] focus:ring-[#7662C7]"
            data-icod-id="src_components_newslettersignup_tsx_d3c8" />
          <Button
            type="submit"
            size="md"
            loading={status === 'loading'}
            disabled={!email.trim()}
            className="bg-[#7662C7] hover:bg-[#6554B5] text-white border-none"
            data-icod-id="src_components_newslettersignup_tsx_0472">
            Subscribe
          </Button>
        </form>
      )}
      {status === 'error' && (
        <Alert
          variant="error"
          className="mt-3"
          data-icod-id="src_components_newslettersignup_tsx_44ed">{message}</Alert>
      )}
    </div>
  );
}
