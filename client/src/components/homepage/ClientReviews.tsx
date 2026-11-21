import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

export interface Review {
  name: string;
  role: string;
  city: string;
  initials: string;
  photo: string;
  text: string;
}

export const MG_REVIEWS: Review[] = [
  { name: "Ayesha", role: "Online Seller", city: "Lahore", initials: "Ay", photo: "https://drive.google.com/thumbnail?id=1AsHrO0Mp5X1utiAHNNWE2sFgIYpiuv7c&sz=w640", text: "I used to spend two hours writing one product description. Now I paste my product details and get a ready description in seconds — my Daraz listings finally look professional." },
  { name: "Fatima", role: "Shopify Store Owner", city: "Karachi", initials: "Fa", photo: "https://drive.google.com/thumbnail?id=1zWoDzCASzZSALOIEmjopzCHDpz5AhZHU&sz=w640", text: "The SEO Title Optimizer changed my shop. My products started appearing in search, and my clicks went up without spending a rupee on ads." },
  { name: "Maryam", role: "Boutique Owner", city: "Islamabad", initials: "Ma", photo: "https://drive.google.com/thumbnail?id=18sP8xgvG-t4BQHodp7r60QAdmX-biuvu&sz=w640", text: "As a new seller I could not afford a freelancer. MG Blessed Beginnings gave me everything free — descriptions, hashtags, social posts — all in one place." },
  { name: "Hina", role: "Home-based Seller", city: "Faisalabad", initials: "Hi", photo: "https://drive.google.com/thumbnail?id=11rusYgvVMvNt_VFFAP600Dp67JIkOC4q&sz=w640", text: "The Profit Calculator is my favourite tool. I finally know my real margin before I set a price — no more guessing, no more losses." },
  { name: "Zainab", role: "Beauty Products Seller", city: "Rawalpindi", initials: "Za", photo: "https://drive.google.com/thumbnail?id=1JhTNQ3wZseF41LB4lZLtDjmTHkQlGyZZ&sz=w640", text: "Brand Campaign Studio built my whole brand voice in minutes — tone, colours, campaign ideas. It feels like having a marketing team for free." },
  { name: "Sana", role: "Handmade Crafts Seller", city: "Multan", initials: "Sa", photo: "https://drive.google.com/thumbnail?id=1FEyD6LwerU2S3nap9AFQE_GWPy-IvBZ4&sz=w640", text: "I run my store alone, and the Social Media Studio writes my posts for me. My Instagram looks consistent now, and customers message me every day." },
  { name: "Ahmed Raza", role: "Daraz Seller", city: "Lahore", initials: "Ah", photo: "https://drive.google.com/thumbnail?id=1nlb3GFEmDopYH5CNK3i7cS3hKsDFauKQ&sz=w640", text: "The Listing Optimizer rewrote my Daraz titles in minutes — my listings finally look like a real brand." },
  { name: "Usman Khan", role: "Shopify Store Owner", city: "Karachi", initials: "Us", photo: "https://drive.google.com/thumbnail?id=1SQj1Xmnb9gkG5rW5FXhfj7YrxrFkqJyq&sz=w640", text: "I run my Shopify store alone. The Product Description Generator writes every description for me now." },
  { name: "Bilal Ahmed", role: "Amazon Seller", city: "Islamabad", initials: "Bi", photo: "https://drive.google.com/thumbnail?id=1bkCDUdkTMxET7WGYScY49PsdOLBN3i9R&sz=w640", text: "Keyword Research showed me exactly what buyers search for. My listings rank higher every week." },
  { name: "Hassan Ali", role: "E-commerce Consultant", city: "Faisalabad", initials: "Ha", photo: "https://drive.google.com/thumbnail?id=1Ryq1egW346RRmW9QsxBbEE8mxWxZ-ead&sz=w640", text: "I recommend MG Blessed Beginnings to all my clients — free tools that do the work of a full marketing team." },
  { name: "Mahnoor Fatima", role: "Instagram Seller", city: "Multan", initials: "Mh", photo: "https://drive.google.com/thumbnail?id=1hDC0PFtR1q5hcXekiUhwlG9N280pbba_&sz=w640", text: "The Hashtag Generator finds hashtags I would never think of. My Instagram reach grew without ads." },
  { name: "Iqra Naveed", role: "Boutique Owner", city: "Rawalpindi", initials: "Iq", photo: "https://drive.google.com/thumbnail?id=1zeiB1-g0hreHlLP2oD7YE7FcrTIXdcAz&sz=w640", text: "Brand Campaign Studio gave my boutique a full brand voice — colours, tone, campaign ideas, all in one place." },
  { name: "Hamza Tariq", role: "Digital Marketer", city: "Lahore", initials: "Hm", photo: "https://drive.google.com/thumbnail?id=1DqAqKFIYK5A4Yg9AC7UM4OZl7o17nQnC&sz=w640", text: "The SEO Title Optimizer is now part of my daily workflow. Every client listing gets an optimized title." },
  { name: "Sara Malik", role: "Home-based Seller", city: "Karachi", initials: "Sr", photo: "https://drive.google.com/thumbnail?id=1rRkmOUbv-IgSkxVgSbwxDllD2SebsGeT&sz=w640", text: "WhatsApp Business Generator writes my customer messages in seconds — order updates, COD follow-ups, everything." },
  { name: "Omar Farooq", role: "eBay Seller", city: "Islamabad", initials: "Om", photo: "https://drive.google.com/thumbnail?id=1eW7LGUjAIlajyUdURSkG7POhv5prITZh&sz=w640", text: "The Profit Calculator tells me my real margin before I list anything. No more guessing on eBay fees." },
  { name: "Noor Fatima", role: "Handmade Crafts Seller", city: "Peshawar", initials: "No", photo: "https://drive.google.com/thumbnail?id=1523Brzlh7OEHEgjFP6C6I8KSVQaGRjA6&sz=w640", text: "The Social Media Studio plans my whole week of posts. My crafts page finally looks consistent." },
  { name: "James Carter", role: "Etsy Seller", city: "London, UK", initials: "Ja", photo: "https://drive.google.com/thumbnail?id=15pUsElS9AtYTnZmBCCcQg-TdCqNLq-Cd&sz=w640", text: "As an Etsy seller, the Product Description Generator saves me hours every single week." },
  { name: "Emily Johnson", role: "Shopify Store Owner", city: "New York, USA", initials: "Em", photo: "https://drive.google.com/thumbnail?id=1E5Lpu9xW0LcIjI1GLoUdhhvJrJ8L8vAq&sz=w640", text: "The Review Response Writer answers my customer reviews in my own brand voice. My rating keeps climbing." },
  { name: "David Miller", role: "Amazon Seller", city: "Toronto, Canada", initials: "Da", photo: "https://drive.google.com/thumbnail?id=1JncQan0ZKEm-AmXnQYRVil2MCVHo_OY_&sz=w640", text: "Competitor Analysis showed me exactly where my listings were weak. I fixed the gaps in one afternoon." },
  { name: "Sophia Lee", role: "E-commerce Seller", city: "Sydney, Australia", initials: "So", photo: "https://drive.google.com/thumbnail?id=1oUmSh1CF-Z0EIZj5vR6AFRQ5o_9b2MKL&sz=w640", text: "The Email Campaign tool writes my newsletters for me. My open rates have never been better." },
  { name: "Omar Hassan", role: "Marketplace Seller", city: "Dubai, UAE", initials: "Oh", photo: "https://drive.google.com/thumbnail?id=1YazbP5sr2SQO3FV5UwWrpJevngit0Ng6&sz=w640", text: "I sell on three marketplaces. These free tools keep all my listings consistent across every one." },
  { name: "Amelia Brown", role: "Instagram Seller", city: "Manchester, UK", initials: "Am", photo: "https://drive.google.com/thumbnail?id=1GEkOsKL4WY6c6Po9arzx_4c4CJdJA8rF&sz=w640", text: "The Prompt Library is my secret weapon — one good prompt and I have a week of content ideas." },
  { name: "Liam Wilson", role: "Dropshipper", city: "Dublin, Ireland", initials: "Li", photo: "https://drive.google.com/thumbnail?id=1VIqMEor3jChTfRJ5X6pZM00PG3lWY6mj&sz=w640", text: "The Branding Assistant built my store's whole look in minutes. It feels like hiring a designer for free." },
  { name: "Aisha Rahman", role: "Online Seller", city: "Kuala Lumpur, Malaysia", initials: "Ai", photo: "https://drive.google.com/thumbnail?id=18c8UZWxD6QmKSxgxTBM8GxaPs_3idwKh&sz=w640", text: "The SEO & Backlink Studio gave me a clear 30-day plan. I finally know what to do next." },
  { name: "Michael Chen", role: "eBay Seller", city: "Singapore", initials: "Mi", photo: "https://drive.google.com/thumbnail?id=1FebU5mrmrZioFYyW6MZi2rXT9sxPN_t4&sz=w640", text: "The Free AI Tokens Hub means I never run out of generations. My whole team uses it daily." },
  { name: "Emma Davis", role: "Handmade Seller", city: "Melbourne, Australia", initials: "Ed", photo: "https://drive.google.com/thumbnail?id=1JrFjPb993lSF1N9D0SmjVu20QpX_xQkU&sz=w640", text: "The AI Video Generator made a promo for my shop in minutes — I posted it the same day." },
];

const AUTO_ADVANCE_MS = 5000;

interface ClientReviewsProps {
  className?: string;
}

function ReviewPhoto({ src, alt, className, initials, eager }: { src: string; alt: string; className: string; initials?: string; eager?: boolean }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  if (failed) {
    return initials ? <span
      className="mg-photo-fallback"
      data-icod-id="src_components_homepage_clientreviews_tsx_d29d">{initials}</span> : null;
  }
  return (
    <img
      className={className}
      src={attempt === 0 ? src : src + "&t=" + attempt}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => {
        if (attempt < 3) {
          setTimeout(() => setAttempt((a) => a + 1), 800);
        } else {
          setFailed(true);
        }
      }}
      data-icod-id="src_components_homepage_clientreviews_tsx_56cb" />
  );
}

export default function ClientReviews({ className }: ClientReviewsProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Incremented on every manual navigation so the auto-advance useEffect
  // restarts its interval from zero (preventing the timer from fighting
  // the user's click).
  const [timerKey, setTimerKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { ref, isInView } = useInView({ threshold: 0.15, triggerOnce: true });

  const total = MG_REVIEWS.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerKey((k) => k + 1);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const wrapped = ((i % total) + total) % total;
      setIndex(wrapped);
      resetTimer();
    },
    [total, resetTimer],
  );

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % total);
    resetTimer();
  }, [total, resetTimer]);

  const prev = useCallback(() => {
    setIndex((prev) => ((prev - 1 + total) % total));
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
      setIndex((prev) => (prev + 1) % total);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, total, timerKey]);

  const review = MG_REVIEWS[index];

  return (
    <section
      className={`mg-testimonials ${className ?? ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      data-icod-id="src_components_homepage_clientreviews_tsx_6408">
      <div
        ref={ref}
        className={`mg-testimonials-inner transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
        data-icod-id="src_components_homepage_clientreviews_tsx_5f3b">
        <span
          className="mg-testimonials-pill"
          data-icod-id="src_components_homepage_clientreviews_tsx_e80f">TESTIMONIALS</span>
        <h2
          className="mg-testimonials-title"
          data-icod-id="src_components_homepage_clientreviews_tsx_2173">
          <span
            className="mg-testimonials-brand"
            data-icod-id="src_components_homepage_clientreviews_tsx_4833">MG Blessed Beginnings</span> Success Stories
        </h2>
        <div
          className="mg-testimonials-stage"
          data-icod-id="src_components_homepage_clientreviews_tsx_0af9">
          <button
            className="mg-testimonials-arrow"
            onClick={prev}
            aria-label="Previous review"
            data-icod-id="src_components_homepage_clientreviews_tsx_2e94">&#8249;</button>
          <div
            className="mg-testimonials-card"
            data-icod-id="src_components_homepage_clientreviews_tsx_dcc7">
            <div
              className="mg-testimonials-avatar"
              data-icod-id="src_components_homepage_clientreviews_tsx_c328">
              <span
                className="mg-testimonials-initials"
                data-icod-id="src_components_homepage_clientreviews_tsx_cb77">{review.initials}</span>
              <ReviewPhoto
                src={review.photo.replace("sz=w640", "sz=w200")}
                alt={review.name}
                className="mg-testimonials-photo"
                eager
                data-icod-id="src_components_homepage_clientreviews_tsx_91ff" />
            </div>
            <div
              className="mg-testimonials-body"
              data-icod-id="src_components_homepage_clientreviews_tsx_69c9">
              <h3 data-icod-id="src_components_homepage_clientreviews_tsx_6399">{review.name}</h3>
              <p
                className="mg-testimonials-role"
                data-icod-id="src_components_homepage_clientreviews_tsx_ded3">{review.role} &middot; {review.city}</p>
              <div
                className="mg-testimonials-stars"
                aria-label="5 out of 5 stars"
                data-icod-id="src_components_homepage_clientreviews_tsx_bd23">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p
                className="mg-testimonials-quote"
                data-icod-id="src_components_homepage_clientreviews_tsx_ac9f">&ldquo;{review.text}&rdquo;</p>
            </div>
          </div>
          <button
            className="mg-testimonials-arrow"
            onClick={next}
            aria-label="Next review"
            data-icod-id="src_components_homepage_clientreviews_tsx_1834">&#8250;</button>
        </div>
        <div
          className="mg-testimonials-thumbs"
          data-icod-id="src_components_homepage_clientreviews_tsx_da18">
          {MG_REVIEWS.map((r, i) => (
            <button
              key={r.name}
              className={i === index ? 'mg-thumb mg-thumb-active' : 'mg-thumb'}
              onClick={() => goTo(i)}
              aria-label={r.name}
              data-icod-id={`src_components_homepage_clientreviews_tsx_706d_${r.name}`}>
              <ReviewPhoto
                src={r.photo.replace("sz=w640", "sz=w200")}
                alt={r.name}
                className=""
                initials={r.initials}
                data-icod-id={`src_components_homepage_clientreviews_tsx_b564_${r.name}`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
