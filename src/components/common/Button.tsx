import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'review';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas select-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong dark:text-ink-inverse dark:hover:bg-brand/80',
  secondary: 'bg-surface-muted text-ink hover:bg-line',
  outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-muted',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  danger: 'bg-danger text-white hover:bg-danger/90 dark:text-ink-inverse',
  success: 'bg-success text-white hover:bg-success/90 dark:text-ink-inverse',
  review: 'bg-review text-white hover:bg-review/90 dark:text-ink-inverse',
};

/** Minimum 44px touch target on `md` and `lg` for comfortable mobile use. */
const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm sm:text-base',
  lg: 'h-12 px-6 text-base',
};

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, icon, iconPosition = 'left', className, children, type, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // Defaults to "button" so a button inside a form never submits by accident.
      type={type ?? 'button'}
      className={buttonStyles(variant, size, cn(fullWidth && 'w-full', className))}
      {...props}
    >
      {icon && iconPosition === 'left' ? <span aria-hidden="true">{icon}</span> : null}
      {children}
      {icon && iconPosition === 'right' ? <span aria-hidden="true">{icon}</span> : null}
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

/** A router link that looks and behaves like a button. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  iconPosition = 'left',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles(variant, size, cn(fullWidth && 'w-full', className))} {...props}>
      {icon && iconPosition === 'left' ? <span aria-hidden="true">{icon}</span> : null}
      {children}
      {icon && iconPosition === 'right' ? <span aria-hidden="true">{icon}</span> : null}
    </Link>
  );
}
