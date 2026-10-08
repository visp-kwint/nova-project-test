
// Примитив карточки — основа всех блоков. (брендбук: тёмный сланец + тень)
import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & {
  children?: ReactNode;
  className?: string | string[];
};

export function Card({ children, className, ...rest }: CardProps) {
  // className может быть строкой или массивом (пикеры пробрасывают состояния):
  // нормализуем в плоский список, иначе join() даст "ui-card integration-item,".
  const classes = ['ui-card', ...(Array.isArray(className) ? className : className ? [className] : [])]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
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
