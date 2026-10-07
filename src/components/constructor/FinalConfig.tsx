
// Финальный экран конфигурации (TZ §3.5).
// Перед отправкой показывает итоговую конфигурацию и предупреждает об
// индивидуальных работах; кнопки: заявка, КП, менеджер, возврат.
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { track } from '@/domain/analytics/track';
import { downloadQuote } from '@/domain/quote';
import type { ConstructorState, PriceResult, Product } from '@/types';

export interface FinalConfigProps {
  state: ConstructorState;
  product?: Product;
  result: PriceResult;
  configLines: string[];
  onGoLead: () => void;
  onGoEdit: () => void;
}

export function FinalConfig({
  state,
  product,
  result,
  configLines,
  onGoLead,
  onGoEdit,
}: FinalConfigProps) {
  const handleQuote = () => {
    track('quote_downloaded');
    downloadQuote(state, product, result);
  };
  return (
    <Card className="final-config">
      <CardTitle>Итоговая конфигурация</CardTitle>
      <CardBody>
        {result.requiresIndividualEstimate && (
          <div className="config-warning">
            <Badge tone="individual">Индивидуальные работы</Badge>
            <p className="muted">
              Конфигурация включает элементы, которые оцениваются индивидуально. Итоговая сумма и
              сроки будут уточнены менеджером в коммерческом предложении.
            </p>
            {result.individualItems.length > 0 && (
              <ul>{result.individualItems.map((i) => <li key={i}>• {i}</li>)}</ul>
            )}
          </div>
        )}

        <ul className="config-lines">
          {configLines.map((l) => <li key={l}>{l}</li>)}
        </ul>

        {result.setupPrice !== null && (
          <div className="price-rows">
            <div>
              <dt>ИТОГО за первый период</dt>
              <dd>{result.firstPeriodTotal?.toLocaleString('ru-RU')} ₽</dd>
            </div>
          </div>
        )}

        <div className="price-actions">
          <Button variant="primary" onClick={onGoLead}>
            Оставить заявку
          </Button>
          <Button variant="outline" onClick={handleQuote}>
            Скачать коммерческое предложение
          </Button>
          <Button variant="outline" onClick={onGoLead}>
            Отправить менеджеру
          </Button>
          <Button variant="ghost" onClick={onGoEdit}>
            Вернуться к редактированию
          </Button>
        </div>
        <p className="field-note">
          Все цены предварительные. Конфигурация: {product?.title ?? 'не выбрано'} ·{' '}
          {state.employeeCount} сотрудников · {state.integrationIds.length} интеграций ·{' '}
          {state.storageGb} ГБ.
        </p>
      </CardBody>
    </Card>
  );
}
