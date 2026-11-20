import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

/**
 * Accessible accordion component for FAQ sections.
 * Supports keyboard navigation and smooth height transitions.
 */
export default function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem(index);
      }
    },
    [toggleItem],
  );

  return (
    <div className={cn('space-y-0', className)} data-icod-id="src_components_faqaccordion_tsx_2a8f">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={cn(
              'border-b border-border transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              isOpen ? 'bg-primary/5' : 'bg-transparent hover:bg-primary/5',
            )}
            data-icod-id={`src_components_faqaccordion_tsx_${index}_container`}>
            <button
              type="button"
              onClick={() => toggleItem(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-full flex items-center justify-between py-6 px-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 rounded-lg"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
              data-icod-id={`src_components_faqaccordion_tsx_${index}_button`}>
              <span
                className={cn(
                  'font-semibold pr-6 transition-colors duration-[400ms]',
                  isOpen ? 'text-primary-hover' : 'text-foreground',
                )}
                data-icod-id={`src_components_faqaccordion_tsx_${index}_question`}>
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                  isOpen && 'rotate-180 text-primary-hover',
                )}
                data-icod-id={`src_components_faqaccordion_tsx_${index}_chevron`} />
            </button>
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={cn(
                'overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
              )}
              data-icod-id={`src_components_faqaccordion_tsx_${index}_answer_wrapper`}>
              <div
                className="px-2 pb-6 text-sm text-muted-foreground leading-relaxed"
                data-icod-id={`src_components_faqaccordion_tsx_${index}_answer`}>
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
