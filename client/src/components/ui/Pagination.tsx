import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Reusable pagination component with page numbers and navigation arrows.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
      data-icod-id="src_components_ui_pagination_tsx_4b3f">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        data-icod-id="src_components_ui_pagination_tsx_bdf5">
        <ChevronLeft className="h-4 w-4" data-icod-id="src_components_ui_pagination_tsx_7d1e" />
      </Button>
      {/* Page numbers */}
      <div
        className="flex items-center gap-1"
        data-icod-id="src_components_ui_pagination_tsx_b219">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-sm text-muted-foreground"
                data-icod-id={`src_components_ui_pagination_tsx_0427_${page}`}>...
                              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'min-w-[2.5rem]',
                isActive && 'pointer-events-none'
              )}
              data-icod-id={`src_components_ui_pagination_tsx_c0cd_${page}`}>
              {page}
            </Button>
          );
        })}
      </div>
      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        data-icod-id="src_components_ui_pagination_tsx_8c43">
        <ChevronRight className="h-4 w-4" data-icod-id="src_components_ui_pagination_tsx_973b" />
      </Button>
    </nav>
  );
}
