/**
 * Shipped UI primitives — this is the complete inventory. Import from here,
 * never from the individual files:
 *
 *   import { Alert, Badge, Button, Card, EmptyState, Field, Input, Modal, Spinner }
 *     from '@/components/ui';
 *
 * These are the ONLY components that belong in this folder. Feature components
 * (NoteCard, Navbar, ProductRow, ...) live in client/src/components/ and are
 * built FROM these.
 *
 * cn() — the Tailwind class merger every className-accepting component must use
 * — lives at @/utils/cn.
 */
export { default as Alert, type AlertProps, type AlertVariant } from './Alert';
export { default as Badge, type BadgeProps, type BadgeVariant } from './Badge';
export {
  default as Button,
  buttonClass,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './Button';
export { default as Card, type CardProps } from './Card';
export { default as CopyButton, type CopyButtonProps } from './CopyButton';
export { default as EmptyState, type EmptyStateProps } from './EmptyState';
export { default as Field, type FieldProps } from './Field';
export { default as Input, inputClass, type InputProps } from './Input';
export { default as MarkdownRenderer, type MarkdownRendererProps } from './MarkdownRenderer';
export { default as Modal, type ModalProps } from './Modal';
export { default as Pagination, type PaginationProps } from './Pagination';
export { default as Skeleton, type SkeletonProps, type SkeletonVariant } from './Skeleton';
export { default as Spinner, type SpinnerProps } from './Spinner';
export { default as Toast, type ToastProps, type ToastVariant } from './Toast';
export { default as ToastContainer } from './ToastContainer';
export { default as Tooltip, type TooltipProps } from './Tooltip';
