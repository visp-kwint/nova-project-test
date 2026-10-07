
// Шаг: хранилище и база знаний (TZ §4.2 «Хранилище и база знаний»).
// Разделяет: самостоятельная загрузка, ручная обработка, нестандартный импорт,
// большие архивы (последние два — индивидуальный расчёт, TZ §6.2).
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import type { ConstructorState } from '@/types';
import type { ConstructorSet } from '@/state/useConstructor';
import type { PricingConfig } from '@/config/pricing-config';

export interface StorageStepProps {
  state: ConstructorState;
  set: ConstructorSet;
  pricing: PricingConfig;
}

export function StorageStep({ state, set, pricing }: StorageStepProps) {
  const extraGb = Math.max(0, state.storageGb - pricing.includedStorageGb);
  return (
    <Card className="storage-step">
      <CardTitle>Хранилище и база знаний</CardTitle>
      <CardBody>
        <div className="field">
          <label className="field-label" htmlFor="storage-gb">
            Объём хранилища, ГБ
          </label>
          <div className="stepper">
            <button
              type="button"
              className="stepper-btn"
              aria-label="Уменьшить объём"
              onClick={() => set('storageGb', Math.max(0, state.storageGb - 1))}
              disabled={state.storageGb <= 0}
            >
              −
            </button>
            <input
              id="storage-gb"
              type="number"
              className="field-input"
              min={0}
              step={1}
              value={state.storageGb}
              onChange={(e) => set('storageGb', Math.max(0, Number(e.target.value) || 0))}
            />
            <button
              type="button"
              className="stepper-btn"
              aria-label="Увеличить объём"
              onClick={() => set('storageGb', state.storageGb + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="toggle-row">
          <Toggle
            id="store-large"
            checked={state.storageLargeArchive}
            onChange={() => set('storageLargeArchive', !state.storageLargeArchive)}
          />
          <label htmlFor="store-large" className="option-label">
            Распознавание больших архивов / нестандартный импорт
          </label>
          {state.storageLargeArchive ? <Badge tone="individual">Индивидуальный расчёт</Badge> : null}
        </div>

        <p className="field-note">
          Включено {pricing.includedStorageGb} ГБ.
          {extraGb > 0
            ? ` Дополнительных ${extraGb} ГБ = ${(extraGb * pricing.perExtraStorageGb)
                .toLocaleString('ru-RU')} ₽/мес.`
            : ''}
        </p>

        <p className="field-note">
          Самостоятельная загрузка материалов включена. Ручная подготовка документов, нестандартный
          импорт и обработка больших архивов переводятся в индивидуальную оценку.
        </p>
      </CardBody>
    </Card>
  );
}
