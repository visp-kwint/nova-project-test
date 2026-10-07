
// Шаг 1: выбор типа решения (TZ §3.1).
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types';

export interface ProductPickerProps {
  products: readonly Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ProductPicker({ products, selectedId, onSelect }: ProductPickerProps) {
  return (
    <div className="product-grid">
      {products.map((p) => {
        const active = p.id === selectedId;
        const individual = p.type === 'custom' || p.type === 'consultation';
        return (
          <Card key={p.id} className={active ? 'product-card active' : 'product-card'} role="button"
                tabIndex={0}
                onClick={() => onSelect(p.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(p.id); }}>
            <div className="product-card-head">
              <h4>{p.title}</h4>
              {individual ? <Badge tone="individual">Индивидуальный расчёт</Badge> : null}
            </div>
            <p className="muted">{p.description}</p>
            <ul className="product-capabilities">
              {p.capabilities.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <div className="product-price">
              <span className="product-price-base">
                {p.basePrice > 0 ? `от ${p.basePrice.toLocaleString('ru-RU')} ₽` : 'по запросу'}
              </span>
              {p.monthlyPrice > 0 ? (
                <span className="product-price-monthly">{p.monthlyPrice.toLocaleString('ru-RU')} ₽/мес</span>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
