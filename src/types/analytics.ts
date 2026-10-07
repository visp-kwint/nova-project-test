// Типы событий аналитики. См. TZ §14.

export type AnalyticsEvent =
  | 'constructor_opened'
  | 'product_selected'
  | 'step_changed'
  | 'integration_added'
  | 'integration_removed'
  | 'individual_estimate_reached'
  | 'lead_form_started'
  | 'lead_submitted'
  | 'validation_error'
  | 'config_reset'
  | 'quote_downloaded';

/**
 * Свойства событий. ВНИМАНИЕ (TZ §14): сюда нельзя попадать персональные
 * данные, текст приватных требований, API-ключи, токены и содержимое
 * документов. domain/analytics/track.ts фильтрует опасные поля.
 */
export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;
