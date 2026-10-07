
// Шаг: функции агента (TZ §3.2 «Функциональность»).
// Показываем только функции, доступные выбранному продукту (разрешения из backend).
import { Card, CardBody } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import type { Feature } from '@/types';

const CATEGORY_LABEL: Record<Feature['category'], string> = {
  generation: 'Генерация',
  knowledge: 'Базы знаний',
  publishing: 'Публикация',
  communication: 'Коммуникации',
  advanced: 'Расширенное',
};

export interface FeaturesPickerProps {
  features: Feature[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function FeaturesPicker({ features, selectedIds, onToggle }: FeaturesPickerProps) {
  if (features.length === 0) {
    return (
      <Card className="step-placeholder">
        <CardBody>
          <p className="muted">Для выбранного продукта нет дополнительных функций.</p>
        </CardBody>
      </Card>
    );
  }
  return (
    <div className="feature-list">
      {features.map((f) => {
        const individual = !!f.requiresIndividualEstimate;
        const included = !individual && f.price === 0;
        const checked = included || selectedIds.includes(f.id);
        return (
          <Card
            key={f.id}
            className={['option-item', checked ? 'selected' : '', included ? 'included' : '']}
          >
            <Toggle
              id={`feat-${f.id}`}
              checked={checked}
              disabled={included}
              onChange={() => onToggle(f.id)}
            />
            <label htmlFor={`feat-${f.id}`} className="option-label">
              <div className="option-title">
                <strong>{f.title}</strong>
                {included ? (
                  <Badge tone="neutral">включено</Badge>
                ) : individual ? (
                  <Badge tone="individual">Индивидуальный расчёт</Badge>
                ) : (
                  <Badge tone="neutral">{CATEGORY_LABEL[f.category]}</Badge>
                )}
              </div>
              <p className="muted">{f.description}</p>
              <div className="option-price">
                {included ? (
                  <span className="is-muted">включено в тариф</span>
                ) : (
                  <>
                    {f.price > 0 ? `+${f.price.toLocaleString('ru-RU')} ₽ к запуску` : 'включено'}
                    {f.monthlyPrice ? ` · ${f.monthlyPrice.toLocaleString('ru-RU')} ₽/мес` : ''}
                  </>
                )}
              </div>
            </label>
          </Card>
        );
      })}
    </div>
  );
}
