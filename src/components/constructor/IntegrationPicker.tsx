
// Шаг 3: каталог интеграций (TZ §3.3). На карточке: цена подключения,
// ограничения, готовый коннектор, уровень сложности, индивидуальный расчёт.
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import type { Integration } from '@/types';

const LEVEL_LABEL: Record<Integration['level'], string> = {
  1: 'базовый',
  2: 'стандартный',
  3: 'расширенный',
  individual: 'индивидуальный',
};

export interface IntegrationPickerProps {
  integrations: Integration[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const rub = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

export function IntegrationPicker({ integrations, selectedIds, onToggle }: IntegrationPickerProps) {
  return (
    <div className="integration-list">
      {integrations.map((it) => {
        const checked = selectedIds.includes(it.id);
        const individual = it.requiresIndividualEstimate || it.level === 'individual';
        const hasPrice = !individual && (it.setupPrice ?? 0) > 0;
        return (
          <Card key={it.id} className={['integration-item', checked ? 'selected' : '']}>
            <Toggle id={`int-${it.id}`} checked={checked} onChange={() => onToggle(it.id)} />
            <label htmlFor={`int-${it.id}`} className="integration-label">
              <div className="integration-title">
                <strong>{it.title}</strong>
                <Badge tone={individual ? 'individual' : 'neutral'}>
                  {individual ? 'Индивидуальный расчёт' : `уровень ${LEVEL_LABEL[it.level]}`}
                </Badge>
                {it.readyConnector ? <Badge tone="gold">Готовый коннектор</Badge> : null}
              </div>
              <p className="muted">{it.description}</p>

              <div className="integration-price">
                {individual ? (
                  <span>Индивидуальный расчёт</span>
                ) : (
                  <span>
                    {hasPrice ? `Подключение: ${rub(it.setupPrice ?? 0)}` : 'Подключение включено'}
                    {it.monthlyPrice ? ` · сопровождение ${rub(it.monthlyPrice)}/мес` : ''}
                  </span>
                )}
              </div>

              {it.limits?.length ? (
                <ul className="integration-reqs">
                  {it.limits.map((r) => <li key={r}>{r}</li>)}
                </ul>
              ) : null}
            </label>
          </Card>
        );
      })}
    </div>
  );
}
