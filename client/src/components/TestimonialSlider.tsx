import { useState, type FormEvent } from 'react';
import { Card, Button, Input, Field, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { MessageSquareHeart, Star, Send, CheckCircle } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface TestimonialSliderProps {
  className?: string;
}

interface FeedbackForm {
  name: string;
  email: string;
  service: string;
  testimonial: string;
  rating: number;
}

const SERVICE_OPTIONS = [
  'Shopify Store Setup',
  'eBay Listing Optimization',
  'Etsy Shop Management',
  'Digital Marketing',
  'AI Tools',
  'Consultation',
  'Other',
];

export default function TestimonialSlider({ className }: TestimonialSliderProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FeedbackForm>({
    name: '',
    email: '',
    service: '',
    testimonial: '',
    rating: 0,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleStarClick = (rating: number) => {
    setForm((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) {
      setMessage('Please select a rating.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      await apiClient.post('/contact', {
        name: form.name,
        email: form.email,
        subject: `Testimonial - ${form.service}`,
        message: `[Rating: ${form.rating}/5]\n\nService: ${form.service}\n\n${form.testimonial}`,
      });
      setStatus('success');
      setMessage('Thank you for your feedback! Your testimonial has been submitted.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={cn('relative', className)} data-icod-id="src_components_testimonialslider_tsx_success">
        <Card className="p-8 md:p-12 text-center" data-icod-id="src_components_testimonialslider_tsx_success_card">
          <CheckCircle
            className="h-16 w-16 text-success mx-auto mb-4"
            data-icod-id="src_components_testimonialslider_tsx_982c" />
          <h3
            className="text-xl font-bold text-foreground mb-2"
            data-icod-id="src_components_testimonialslider_tsx_5fd9">Thank You!</h3>
          <p
            className="text-muted-foreground"
            data-icod-id="src_components_testimonialslider_tsx_0132">{message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={() => {
              setStatus('idle');
              setShowForm(false);
              setForm({ name: '', email: '', service: '', testimonial: '', rating: 0 });
            }}
            data-icod-id="src_components_testimonialslider_tsx_reset_btn">
            Submit Another
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} data-icod-id="src_components_testimonialslider_tsx_6a9b">
      {!showForm ? (
        <Card className="p-8 md:p-12 text-center" data-icod-id="src_components_testimonialslider_tsx_6e1c">
          {/* Icon */}
          <div className="mb-6 flex justify-center" data-icod-id="src_components_testimonialslider_tsx_f1d6">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ background: 'var(--gradient-primary)' }}
              data-icod-id="src_components_testimonialslider_tsx_f0ca">
              <MessageSquareHeart className="h-6 w-6" data-icod-id="src_components_testimonialslider_tsx_6662" />
            </div>
          </div>

          {/* Heading */}
          <h3
            className="text-xl font-bold text-foreground mb-4 font-heading"
            data-icod-id="src_components_testimonialslider_tsx_heading">
            Be the First to Share Your Experience
          </h3>

          {/* Honest message */}
          <p
            className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto mb-6"
            data-icod-id="src_components_testimonialslider_tsx_message">
            I'm building a collection of genuine testimonials from students and clients. If we've worked together, I'd love to hear about your experience.
          </p>

          <p
            className="text-sm text-muted-foreground italic mb-8"
            data-icod-id="src_components_testimonialslider_tsx_note">
            Real testimonials will be added here as they come in — no fabricated reviews, ever.
          </p>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowForm(true)}
            data-icod-id="src_components_testimonialslider_tsx_show_form_btn">
            <Star
              className="h-4 w-4 mr-2"
              data-icod-id="src_components_testimonialslider_tsx_a93e" />
            Share Your Experience
          </Button>
        </Card>
      ) : (
        <Card className="p-6 md:p-8" data-icod-id="src_components_testimonialslider_tsx_form_card">
          <div className="flex items-center justify-between mb-6" data-icod-id="src_components_testimonialslider_tsx_form_header">
            <h3
              className="text-xl font-bold text-foreground"
              data-icod-id="src_components_testimonialslider_tsx_f32a">Share Your Experience</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-icod-id="src_components_testimonialslider_tsx_cancel_btn">
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-icod-id="src_components_testimonialslider_tsx_form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-icod-id="src_components_testimonialslider_tsx_form_row1">
              <Field label="Your Name" htmlFor="testimonial-name" required data-icod-id="src_components_testimonialslider_tsx_name_field">
                <Input
                  id="testimonial-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  data-icod-id="src_components_testimonialslider_tsx_name_input" />
              </Field>
              <Field label="Email" htmlFor="testimonial-email" required data-icod-id="src_components_testimonialslider_tsx_email_field">
                <Input
                  id="testimonial-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  data-icod-id="src_components_testimonialslider_tsx_email_input" />
              </Field>
            </div>

            <Field label="Service Used" htmlFor="testimonial-service" required data-icod-id="src_components_testimonialslider_tsx_service_field">
              <select
                id="testimonial-service"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-icod-id="src_components_testimonialslider_tsx_service_select">
                <option value="" data-icod-id="src_components_testimonialslider_tsx_0bb1">Select a service...</option>
                {SERVICE_OPTIONS.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    data-icod-id={`src_components_testimonialslider_tsx_c8be_${opt}`}>{opt}</option>
                ))}
              </select>
            </Field>

            <Field label="Your Rating" htmlFor="testimonial-rating" required data-icod-id="src_components_testimonialslider_tsx_rating_field">
              <div className="flex gap-1" data-icod-id="src_components_testimonialslider_tsx_stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    data-icod-id={`src_components_testimonialslider_tsx_star_${star}`}>
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        star <= form.rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                      )}
                      data-icod-id={`src_components_testimonialslider_tsx_35a4_${star}`} />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Your Testimonial" htmlFor="testimonial-text" required data-icod-id="src_components_testimonialslider_tsx_text_field">
              <textarea
                id="testimonial-text"
                value={form.testimonial}
                onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                placeholder="Share your experience working with Mahreen..."
                required
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                data-icod-id="src_components_testimonialslider_tsx_text_input" />
              <p className="text-xs text-muted-foreground mt-2 italic" data-icod-id="src_components_testimonialslider_tsx_review_note">
                Your feedback will be reviewed before being published.
              </p>
            </Field>

            {status === 'error' && (
              <Alert variant="error" data-icod-id="src_components_testimonialslider_tsx_error">{message}</Alert>
            )}

            <Button
              type="submit"
              loading={status === 'loading'}
              className="w-full"
              data-icod-id="src_components_testimonialslider_tsx_submit_btn">
              <Send
                className="h-4 w-4 mr-2"
                data-icod-id="src_components_testimonialslider_tsx_44d4" />
              Submit Testimonial
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
