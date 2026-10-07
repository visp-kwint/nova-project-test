
// Валидация формы заявки и состояния конструктора. TZ §3.5, §10.3, §16.
import type { ConstructorState } from '@/types';
import { z } from 'zod';

/** Данные формы заявки (обезличенные). TZ §3.5. */
export const leadSchema = z.object({
  contactName: z.string().min(2, 'Укажите имя').max(80),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(10, 'Укажите телефон').max(20).optional().or(z.literal('')),
  company: z.string().max(120).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
});
export type LeadData = z.infer<typeof leadSchema>;

export interface ValidationResult {
  ok: boolean;
  /** Поля с ошибками. */
  errors: Record<string, string>;
}

export function validateLead(input: unknown): ValidationResult {
  const res = leadSchema.safeParse(input);
  if (res.success) return { ok: true, errors: {} };
  const errors: Record<string, string> = {};
  for (const issue of res.error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** Базовая проверка, что конфигурация заполнена достаточно для заявки. */
export function validateStateForLead(state: ConstructorState): string[] {
  const problems: string[] = [];
  if (!state.productId) problems.push('Выберите тип решения.');
  if (state.employeeCount < 1) problems.push('Укажите хотя бы одного сотрудника.');
  if (state.employeeCount > 100) problems.push('Слишком много сотрудников — укажите до 100.');
  if (state.storageGb < 0) problems.push('Объём хранилища не может быть отрицательным.');
  return problems;
}
