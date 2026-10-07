// Единые названия режимов оплаты AI (пункт 6 ТЗ: название должно быть
// одинаковым в шаге 7 и в итоговой конфигурации). Источник правды — один.
import type { AiPaymentMode } from '@/types';

export interface AiModeMeta {
  value: AiPaymentMode;
  /** Короткое название для итогов/конфигов. */
  label: string;
  /** Подсказка для шага 7. */
  hint: string;
}

export const AI_MODES: AiModeMeta[] = [
  {
    value: 'own-account',
    label: 'Собственный API-ключ / аккаунт',
    hint: 'Вы подключаете свой бюджет на AI.',
  },
  {
    value: 'shared-balance',
    label: 'Общий баланс AI',
    hint: 'Мы ведём общий баланс и начисляем расход.',
  },
  {
    value: 'later',
    label: 'Уточнить способ оплаты позже',
    hint: 'Оплата AI будет определена после запуска.',
  },
];

export const AI_MODE_LABEL: Record<AiPaymentMode, string> = {
  'own-account': 'Собственный API-ключ / аккаунт',
  'shared-balance': 'Общий баланс AI',
  later: 'Уточнить способ оплаты позже',
};
