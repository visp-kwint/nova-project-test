
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'outline-cta';
  children: ReactNode;
}

// Кнопки: primary — Nova Gold, ghost/outline — поверх тёмного,
// outline-cta — прозрачная с золотой рамкой (главный CTA в hero).
export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  const cls = ['ui-btn', `ui-btn-${variant}`, className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
