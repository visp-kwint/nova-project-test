
import type { ReactNode } from 'react';

// Метки: стандартное / индивидуальное (TZ §6.2 — «Индивидуальный расчёт»).
export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'gold' | 'individual'; children: ReactNode }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}
