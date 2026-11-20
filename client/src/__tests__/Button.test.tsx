/**
 * Component tests for the Button UI primitive.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/ui/Button';

describe('Button Component', () => {
  it('should render with default variant', () => {
    render(<Button data-icod-id="src_tests_button_test_tsx_aaa3">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should render with primary variant', () => {
    render(<Button variant="primary" data-icod-id="src_tests_button_test_tsx_2bcb">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-primary');
  });

  it('should render with outline variant', () => {
    render(<Button variant="outline" data-icod-id="src_tests_button_test_tsx_e1f7">Outline</Button>);
    const button = screen.getByRole('button', { name: /outline/i });
    expect(button).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled data-icod-id="src_tests_button_test_tsx_2a99">Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button loading data-icod-id="src_tests_button_test_tsx_61ba">Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} data-icod-id="src_tests_button_test_tsx_155a">Click</Button>);
    
    const button = screen.getByRole('button', { name: /click/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button
      disabled
      onClick={handleClick}
      data-icod-id="src_tests_button_test_tsx_faca">Click</Button>);
    
    const button = screen.getByRole('button', { name: /click/i });
    await userEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm" data-icod-id="src_tests_button_test_tsx_4fa8">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="md" data-icod-id="src_tests_button_test_tsx_0190">Medium</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg" data-icod-id="src_tests_button_test_tsx_0b8c">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
