
// Шаг: сотрудники и доступы (TZ §4.2 «Сотрудники и доступы»).
// Первый администратор включён в базовую стоимость; остальные — отдельно.
import { useEffect } from 'react';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { monthlyRow } from '@/domain/text';
import type { ConstructorState } from '@/types';
import type { ConstructorSet } from '@/state/useConstructor';
import type { PricingConfig } from '@/config/pricing-config';

export interface TeamStepProps {
  state: ConstructorState;
  set: ConstructorSet;
  pricing: PricingConfig;
}

export function TeamStep({ state, set, pricing }: TeamStepProps) {
  // Администратор — это сотрудник: их не может быть больше, чем всего сотрудников.
  // При уменьшении штата урезаем число админов, чтобы расчёт не врал (п.7).
  useEffect(() => {
    if (state.adminCount > state.employeeCount) set('adminCount', state.employeeCount);
  }, [state.adminCount, state.employeeCount, set]);

  return (
    <Card className="team-step">
      <CardTitle>Сотрудники и доступы</CardTitle>
      <CardBody>
        <div className="counter-row">
          <Counter
            label="Сотрудников всего"
            value={state.employeeCount}
            min={1}
            max={100}
            onChange={(v) => set('employeeCount', v)}
          />
          <Counter
            label="Администраторов (первый — в тарифе)"
            value={state.adminCount}
            min={1}
            max={Math.max(1, state.employeeCount)}
            onChange={(v) => set('adminCount', v)}
          />
        </div>

        <div className="toggle-row">
          <Toggle
            id="pers-history"
            checked={state.personalHistory}
            onChange={() => set('personalHistory', !state.personalHistory)}
          />
          <label htmlFor="pers-history" className="option-label">
            Личная история у каждого
          </label>
        </div>

        <div className="toggle-row">
          <Toggle
            id="pers-kb"
            checked={state.personalKnowledgeBase}
            onChange={() => set('personalKnowledgeBase', !state.personalKnowledgeBase)}
          />
          <label htmlFor="pers-kb" className="option-label">
            Индивидуальная база знаний
          </label>
        </div>

        <div className="toggle-row">
          <Toggle
            id="shared-kb"
            checked={state.sharedCompanyKb}
            onChange={() => set('sharedCompanyKb', !state.sharedCompanyKb)}
          />
          <label htmlFor="shared-kb" className="option-label">
            Доступ к общей базе компании
          </label>
        </div>

        <p className="field-note">
          Первый администратор включён в базовый тариф. Остальные сотрудники оплачиваются как
          {monthlyRow(1, pricing.perExtraEmployee)} за место, дополнительные администраторы — как
          {monthlyRow(1, pricing.perExtraAdmin)} (сверх первого).
        </p>
      </CardBody>
    </Card>
  );
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="counter">
      <span className="counter-label">{label}</span>
      <div className="counter-controls">
        <button
          type="button"
          className="counter-btn"
          aria-label="Уменьшить"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <span className="counter-value">{value}</span>
        <button
          type="button"
          className="counter-btn"
          aria-label="Увеличить"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
