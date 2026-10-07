
// Генератор коммерческого предложения (TZ §18, §3.5). Обезличенный текст:
// без ПДн, API-ключей и конфиденциальных сведений (TZ §1).
import type { ConstructorState, PriceResult, Product } from '@/types';
import { AI_MODE_LABEL } from '@/config/ai-modes';
import { plural } from '@/domain/text';

export function generateQuote(state: ConstructorState, product?: Product, result?: PriceResult): string {
  const lines: string[] = [];
  lines.push('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ (предварительное)');
  lines.push('NOVA — конструктор AI-сервисов');
  lines.push('Дата: ' + new Date().toLocaleDateString('ru-RU'));
  lines.push('');
  lines.push('== Конфигурация ==');
  lines.push('Тип решения: ' + (product?.title ?? 'не выбрано'));
  const nFeat = state.featureIds.length;
  lines.push(
    'Функции: ' + (nFeat ? `${nFeat} ${plural(nFeat, ['функция', 'функции', 'функций'])}` : '—'),
  );
  const nInt = state.integrationIds.length;
  lines.push(
    'Интеграции: ' +
      (nInt ? `${nInt} ${plural(nInt, ['интеграция', 'интеграции', 'интеграций'])}` : '—'),
  );
  lines.push(
    `Сотрудники: ${state.employeeCount} ${plural(state.employeeCount, ['сотрудник', 'сотрудника', 'сотрудников'])} (администраторов: ${state.adminCount})`,
  );
  lines.push('Хранилище: ' + state.storageGb + ' ГБ');
  lines.push('Способ оплаты AI: ' + AI_MODE_LABEL[state.aiPaymentMode]);
  if (state.customRequirements.trim()) {
    lines.push('Дополнительные требования: ' + state.customRequirements.trim());
  }
  lines.push('');
  lines.push('== Расчёт ==');
  if (result) {
    if (result.setupPrice !== null) {
      lines.push('Запуск (разово): ' + result.setupPrice.toLocaleString('ru-RU') + ' ₽');
    }
    if (result.monthlyPrice !== null) {
      lines.push('Ежемесячно: ' + result.monthlyPrice.toLocaleString('ru-RU') + ' ₽');
    }
    if (result.firstPeriodTotal !== null) {
      lines.push('ИТОГО за первый период: ' + result.firstPeriodTotal.toLocaleString('ru-RU') + ' ₽');
    }
    if (result.aiBudgetEstimate && result.aiBudgetEstimate > 0) {
      lines.push('Ориентировочный бюджет AI: ~' + result.aiBudgetEstimate.toLocaleString('ru-RU') + ' ₽/мес');
    }
    if (result.requiresIndividualEstimate) {
      lines.push('Индивидуальный расчёт: ' + (result.individualItems.join(', ') || 'да'));
    }
  }
  lines.push('');
  lines.push('Расчёт носит предварительный характер. Итоговые цены и сроки подтверняются');
  lines.push('менеджером. Конфиденциальные сведения в документ не включаются.');
  return lines.join('\n');
}

/** Скачивает КП как .txt файл (безопасно, без ПДн). */
export function downloadQuote(state: ConstructorState, product?: Product, result?: PriceResult): void {
  if (typeof document === 'undefined') return;
  const text = generateQuote(state, product, result);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nova-kommercheskoe-predlozhenie.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
