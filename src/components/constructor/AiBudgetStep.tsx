
// Шаг 7: AI-бюджет (TZ §4.2 «Шаг 7. AI-бюджет»).
// Свой ключ / общий баланс / позже + предупреждение о факторах расхода.
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AI_MODES } from '@/config/ai-modes';
import type { ConstructorState } from '@/types';
import type { ConstructorSet } from '@/state/useConstructor';
import type { PricingConfig } from '@/config/pricing-config';

export interface AiBudgetStepProps {
  state: ConstructorState;
  set: ConstructorSet;
  pricing: PricingConfig;
}

const COST_FACTORS = [
  'количество запросов',
  'размер документов',
  'поисковые операции',
  'генерация изображений',
  'голосовые функции',
  'внешние инструменты',
];

export function AiBudgetStep({ state, set, pricing }: AiBudgetStepProps) {
  const estimate = pricing.aiBudgetByMode[state.aiPaymentMode] ?? 0;
  return (
    <Card className="ai-step">
      <CardTitle>AI-бюджет</CardTitle>
      <CardBody>
        <div className="radio-group" role="radiogroup" aria-label="Способ оплаты AI">
          {AI_MODES.map((m) => (
            <label key={m.value} className="radio-row">
              <input
                type="radio"
                name="ai-mode"
                checked={state.aiPaymentMode === m.value}
                onChange={() => set('aiPaymentMode', m.value)}
              />
              <span className="radio-label">
                {m.label}
                <small className="muted">{m.hint}</small>
              </span>
            </label>
          ))}
        </div>

        {state.aiPaymentMode !== 'later' && (
          <p className="field-note">
            Ориентировочный бюджет AI: ~{estimate.toLocaleString('ru-RU')} ₽/мес
          </p>
        )}

        <div className="ai-warning">
          <Badge tone="neutral">Важно</Badge>
          <p className="muted">
            Расход AI зависит от: {COST_FACTORS.join(', ')}. Фиксированный безлимитный расход AI по
            умолчанию не заявляется.
          </p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="custom-req">
            Дополнительные ограничения / требования
          </label>
          <textarea
            id="custom-req"
            className="field-textarea"
            rows={3}
            placeholder="Опишите особые требования, если есть"
            value={state.customRequirements}
            onChange={(e) => set('customRequirements', e.target.value)}
          />
          <p className="field-note">
            Текст личных требований не передаётся в аналитику и идёт только в заявку менеджеру.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
