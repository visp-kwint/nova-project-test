
// Примитив карточки — основа всех блоков. (брендбук: тёмный сланец + тень)
import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & {
  children?: ReactNode;
  className?: string | string[];
};

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={['ui-card', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="ui-card-title">{children}</h3>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="ui-card-body">{children}</div>;
}
