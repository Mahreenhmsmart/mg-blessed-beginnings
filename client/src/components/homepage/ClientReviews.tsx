import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

interface Review {
  name: string;
  role: string;
  city: string;
  quote: string;
  avatarColor: string;
}

const REVIEWS: Review[] = [
  {
    name: 'Ayesha',
    role: 'Online Seller',
    city: 'Lahore',
    quote:
      'I used to spend two hours writing one product description. Now I paste my product details and get a ready description in seconds — my Daraz listings finally look professional.',
    avatarColor: '#9D6AFF',
  },
  {
    name: 'Fatima',
    role: 'Shopify Store Owner',
    city: 'Karachi',
    quote:
      'The SEO Title Optimizer changed my shop. My products started appearing in search, and my clicks went up without spending a rupee on ads.',
    avatarColor: '#00D4F5',
  },
  {
    name: 'Maryam',
    role: 'Boutique Owner',
    city: 'Islamabad',
    quote:
      'As a new seller I could not afford a freelancer. MG Blessed Beginnings gave me everything free — descriptions, hashtags, social posts — all in one place.',
    avatarColor: '#FF6EB4',
  },
  {
    name: 'Hina',
    role: 'Home-based Seller',
    city: 'Faisalabad',
    quote:
      'The Profit Calculator is my favourite tool. I finally know my real margin before I set a price — no more guessing, no more losses.',
    avatarColor: '#FFAA44',
  },
  {
    name: 'Zainab',
    role: 'Beauty Products Seller',
    city: 'Rawalpindi',
    quote:
      'Brand Campaign Studio built my whole brand voice in minutes — tone, colours, campaign ideas. It feels like having a marketing team for free.',
    avatarColor: '#34D66B',
  },
  {
    name: 'Sana',
    role: 'Handmade Crafts Seller',
    city: 'Multan',
    quote:
      'I run my store alone, and the Social Media Studio writes my posts for me. My Instagram looks consistent now, and customers message me every day.',
    avatarColor: '#4D9FFF',
  },
];

const AUTO_ADVANCE_MS = 5000;

interface ClientReviewsProps {
  className?: string;
}

export default function ClientReviews({ className }: ClientReviewsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Incremented on every manual navigation so the auto-advance useEffect
  // restarts its interval from zero (preventing the timer from fighting
  // the user's click).
  const [timerKey, setTimerKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true });

  const total = REVIEWS.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerKey((k) => k + 1);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const wrapped = ((index % total) + total) % total;
      setActiveIndex(wrapped);
      resetTimer();
    },
    [total, resetTimer],
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
    resetTimer();
  }, [total, resetTimer]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => ((prev - 1 + total) % total));
    resetTimer();
  }, [total, resetTimer]);

  // Auto-advance timer — restarts whenever isPaused, total, or timerKey
  // changes (timerKey bumps on every manual click so the interval resets).
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, total, timerKey]);

  return (
    <section
      className={cn('py-20 md:py-28 relative overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      data-icod-id="src_components_homepage_clientreviews_tsx_section"
    >
      {/* Background tint */}
      <div
        className="absolute inset-0 bg-primary/5"
        aria-hidden="true"
        data-icod-id="src_components_homepage_clientreviews_tsx_bg"
      />
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
        data-icod-id="src_components_homepage_clientreviews_tsx_container"
      >
        {/* Section heading */}
        <h2
          className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 font-heading"
          data-icod-id="src_components_homepage_clientreviews_tsx_heading"
        >
          What Our Sellers Say
        </h2>
        <p
          className="text-center text-muted-foreground mb-12 max-w-xl mx-auto"
          data-icod-id="src_components_homepage_clientreviews_tsx_subheading"
        >
          Real stories from sellers across Pakistan who are growing their businesses with our free AI tools.
        </p>

        {/* Carousel viewport */}
        <div
          className="relative"
          data-icod-id="src_components_homepage_clientreviews_tsx_viewport"
        >
          {/* Previous arrow */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous review"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-icod-id="src_components_homepage_clientreviews_tsx_prev_btn"
          >
            <ChevronLeft
              className="h-5 w-5"
              data-icod-id="src_components_homepage_clientreviews_tsx_4345" />
          </button>

          {/* Slide */}
          <Card
            className="p-8 md:p-10 text-center min-h-[320px] flex flex-col items-center justify-center"
            data-icod-id="src_components_homepage_clientreviews_tsx_card"
          >
            {/* Avatar circle with initial */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white mb-6 shadow-lg"
              style={{ backgroundColor: REVIEWS[activeIndex].avatarColor }}
              aria-hidden="true"
              data-icod-id="src_components_homepage_clientreviews_tsx_avatar"
            >
              {REVIEWS[activeIndex].name.charAt(0)}
            </div>

            {/* 5 gold stars */}
            <div
              className="flex gap-1 mb-5"
              aria-label="5 out of 5 stars"
              data-icod-id="src_components_homepage_clientreviews_tsx_stars"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 fill-warning text-warning"
                  data-icod-id={`src_components_homepage_clientreviews_tsx_star_${star}`}
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote
              className="text-lg md:text-xl text-foreground leading-relaxed italic mb-6 max-w-2xl"
              data-icod-id="src_components_homepage_clientreviews_tsx_quote"
            >
              &ldquo;{REVIEWS[activeIndex].quote}&rdquo;
            </blockquote>

            {/* Name, role, city */}
            <div
              className="flex flex-col items-center gap-1"
              data-icod-id="src_components_homepage_clientreviews_tsx_author"
            >
              <span
                className="font-bold text-foreground text-base"
                data-icod-id="src_components_homepage_clientreviews_tsx_name"
              >
                {REVIEWS[activeIndex].name}
              </span>
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_components_homepage_clientreviews_tsx_role_city"
              >
                {REVIEWS[activeIndex].role} &middot; {REVIEWS[activeIndex].city}
              </span>
            </div>
          </Card>

          {/* Next arrow */}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next review"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:bg-secondary hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-icod-id="src_components_homepage_clientreviews_tsx_next_btn"
          >
            <ChevronRight
              className="h-5 w-5"
              data-icod-id="src_components_homepage_clientreviews_tsx_35d8" />
          </button>
        </div>

        {/* Navigation dots */}
        <div
          className="flex items-center justify-center gap-2 mt-8"
          role="tablist"
          aria-label="Review navigation"
          data-icod-id="src_components_homepage_clientreviews_tsx_dots"
        >
          {REVIEWS.map((review, index) => (
            <button
              key={review.name}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to review ${index + 1}`}
              onClick={() => goTo(index)}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                index === activeIndex
                  ? 'w-8 bg-primary'
                  : 'w-2.5 bg-border hover:bg-muted-foreground/50',
              )}
              data-icod-id={`src_components_homepage_clientreviews_tsx_dot_${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
