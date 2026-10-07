
// Аналитика: события и приватные поля. TZ §14.
// Запрещено передавать: ПДн, текст приватных требований, API-ключи, токены,
// содержимое документов. Здесь — единая точка отправки.
import type { AnalyticsEvent, AnalyticsProperties } from '@/types';

/** Заглушка отправки: в продакшене заменить на POST /events или шину. */
type Transport = (event: AnalyticsEvent, props: AnalyticsProperties) => void;

// Базовый транспортер пишет в консоль в dev, отбрасывает в prod.
const devTransport: Transport = (event, props) => {
  if (import.meta.env.DEV) {
    console.info('[analytics]', event, props);
  }
};

let transport: Transport = devTransport;

export function setAnalyticsTransport(next: Transport): void {
  transport = next;
}

// Поля, которые нельзя отправлять ни при каких условиях (TZ §14).
const FORBIDDEN_KEYS = new Set([
  'name', 'contactName', 'email', 'phone', 'company',
  'message', 'customRequirements', 'apiKey', 'token', 'accessToken',
  'password', 'requirements',
]);

/** Убирает запрещённые поля и возвращает безопасные свойства. */
export function sanitizeProps(props: AnalyticsProperties): AnalyticsProperties {
  const clean: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(props)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

/** Точка входа: трекает событие после приватной фильтрации (TZ §14). */
export function track(event: AnalyticsEvent, props: AnalyticsProperties = {}): void {
  transport(event, sanitizeProps(props));
}
