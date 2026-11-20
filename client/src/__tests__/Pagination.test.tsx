/**
 * Component tests for the Pagination UI primitive.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../components/ui/Pagination';

describe('Pagination Component', () => {
  it('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        data-icod-id="src_tests_pagination_test_tsx_44c8" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls when totalPages > 1', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        data-icod-id="src_tests_pagination_test_tsx_78d0" />
    );
    
    // Should have previous and next buttons
    expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
    
    // Should have page number buttons
    expect(screen.getByLabelText(/page 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/page 5/i)).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        data-icod-id="src_tests_pagination_test_tsx_f581" />
    );
    
    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={() => {}}
        data-icod-id="src_tests_pagination_test_tsx_e94e" />
    );
    
    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange when clicking a page number', async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
        data-icod-id="src_tests_pagination_test_tsx_ba11" />
    );
    
    const page3Button = screen.getByLabelText(/page 3/i);
    await userEvent.click(page3Button);
    
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with next page when clicking next', async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={handlePageChange}
        data-icod-id="src_tests_pagination_test_tsx_680d" />
    );
    
    const nextButton = screen.getByLabelText(/next/i);
    await userEvent.click(nextButton);
    
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with previous page when clicking previous', async () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
        data-icod-id="src_tests_pagination_test_tsx_5038" />
    );
    
    const prevButton = screen.getByLabelText(/previous/i);
    await userEvent.click(prevButton);
    
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('should show ellipsis for large page counts', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={20}
        onPageChange={() => {}}
        data-icod-id="src_tests_pagination_test_tsx_9d7b" />
    );
    
    // Should have ellipsis indicators
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });
});
