import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-bg font-semibold active:opacity-80 disabled:opacity-40',
  secondary: 'bg-surface-2 text-text border border-border active:bg-border disabled:opacity-40',
  ghost: 'bg-transparent text-accent active:bg-surface disabled:opacity-40',
  danger: 'bg-danger/15 text-danger border border-danger/40 active:bg-danger/25 disabled:opacity-40',
};
const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-base rounded-xl',
  lg: 'h-13 px-5 text-lg rounded-2xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', block, className = '', children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 select-none transition-opacity ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
