
// Итоговая карточка расчёта (TZ §3.4, §10.3). Детальные строки + ИТОГО за
// первый период + индивидуальные услуги + кнопки.
import { useEffect, useRef } from 'react';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { track } from '@/domain/analytics/track';
import type { PriceResult } from '@/types';

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

export interface PriceSummaryProps {
  result: PriceResult;
  hasProduct: boolean;
  onEdit: () => void;
  onShowConfig: () => void;
  onQuote: () => void;
  showActions?: boolean;
}

export function PriceSummary({
  result,
  hasProduct,
  onEdit,
  onShowConfig,
  onQuote,
  showActions = true,
}: PriceSummaryProps) {
  // TZ §14: «переход к индивидуальному расчёту» — одно событие, только на
  // переход из нормального расчёта в индивидуальный (не при каждом изменении).
  const prevIndividualRef = useRef(false);
  useEffect(() => {
    const wasIndividual = prevIndividualRef.current;
    prevIndividualRef.current = result.requiresIndividualEstimate;
    if (result.requiresIndividualEstimate && !wasIndividual) {
      track('individual_estimate_reached', { items: result.individualItems.length });
    }
  }, [result.requiresIndividualEstimate, result.individualItems.length]);

  if (!hasProduct) {
    return (
      <Card className="price-summary">
        <CardTitle>Расчёт стоимости</CardTitle>
        <CardBody>
          <p className="muted">Итог появится после выбора типа решения и настройки конфигурации.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="price-summary">
      <CardTitle>Расчёт стоимости</CardTitle>
      <CardBody>
        {result.requiresIndividualEstimate && (
          <div className="price-individual">
            <Badge tone="individual">Индивидуальный расчёт</Badge>
            <p className="muted">
              Для этой конфигурации точный расчёт делается вручную. Оставьте заявку — пришлём
              коммерческое предложение.
            </p>
            {result.individualItems.length > 0 && (
              <ul>{result.individualItems.map((i) => <li key={i}>• {i}</li>)}</ul>
            )}
          </div>
        )}

        {result.setupPrice !== null && (
          <dl className="price-rows">
            {result.lineItems.length > 0 && (
              <div className="price-lines">
                <dt>Состав:</dt>
                <dd>
                  <ul>
                    {result.lineItems.map((li, idx) => (
                      <li key={idx}>
                        {li.label}
                        {li.kind === 'individual'
                          ? ' — индивидуальный расчёт'
                          : li.value > 0
                            ? ` · ${rub(li.value)}${li.note ? ` ${li.note}` : ''}`
                            : ''}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div>
              <dt>Запуск (разово)</dt>
              <dd>{rub(result.setupPrice)}</dd>
            </div>
            <div>
              <dt>Ежемесячно</dt>
              <dd>{rub(result.monthlyPrice ?? 0)}</dd>
            </div>
            <div className="price-total">
              <dt>ИТОГО за первый период</dt>
              <dd>{rub(result.firstPeriodTotal ?? 0)}</dd>
            </div>
          </dl>
        )}

        {result.aiBudgetEstimate !== null && result.aiBudgetEstimate > 0 && (
          <p className="price-ai muted">
            Ориентировочный бюджет AI: ~{rub(result.aiBudgetEstimate)}/мес
          </p>
        )}

        {result.warnings.length > 0 && (
          <ul className="price-warnings">
            {result.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        )}

        {showActions && (
          <div className="price-actions">
            <Button variant="primary" onClick={onQuote}>
              Оставить заявку
            </Button>
            <Button variant="outline" onClick={onShowConfig}>
              Показать конфигурацию
            </Button>
            <Button variant="ghost" onClick={onEdit}>
              Вернуться к редактированию
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
