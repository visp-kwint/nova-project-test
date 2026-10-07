
// Административная конфигурация расчёта. TZ §5, §6.2: все тарифы — через
// конфигурацию, не жёстко в UI. В продакшене подгружается с backend
// (GET /api/construct/pricing-config) и может меняться без пересборки.
import type { AiPaymentMode, ProductType } from '@/types';

export interface LevelPricing {
  /** Разовая стоимость подключения, ₽. */
  setup: number;
  /** Ежемесячное сопровождение, ₽/мес. */
  monthly: number;
}

export interface PricingConfig {
  /** Доплата за каждого дополнительного сотрудника, ₽/мес. */
  perExtraEmployee: number;
  /** Доплата за каждого дополнительного администратора, ₽/мес. */
  perExtraAdmin: number;
  /** Базовое бесплатное хранилище, ГБ. */
  includedStorageGb: number;
  /** Доплата за каждый дополнительный ГБ, ₽/мес. */
  perExtraStorageGb: number;
  /** Сопровождение интеграции по уровням сложности. */
  integrationLevels: Record<'basic' | 'standard' | 'advanced', LevelPricing>;
  /** Порог: больше N авто-интеграций → индивидуальный расчёт (TZ §5.5). */
  maxAutoIntegrations: number;
  /** Пакетная скидка обслуживания для комплектных продуктов, 0–1. */
  multiAgentMaintenanceDiscount: number;
  /** Пакетная скидка запуска для комплектных продуктов, 0–1. */
  multiAgentSetupDiscount: number;
  /** Бюджет AI (₽/мес) по способу оплаты — демонстрационная оценка. */
  aiBudgetByMode: Record<AiPaymentMode, number>;
  /** Типы продуктов, которые всегда уходят в индивидуальный расчёт. */
  individualProductTypes: ProductType[];
}

/** Обезличенные демонстрационные значения. */
export const PRICING_CONFIG: PricingConfig = {
  perExtraEmployee: 1500,
  perExtraAdmin: 2500,
  includedStorageGb: 10,
  perExtraStorageGb: 300,
  integrationLevels: {
    basic: { setup: 9000, monthly: 1500 },
    standard: { setup: 18000, monthly: 2500 },
    advanced: { setup: 24000, monthly: 4000 },
  },
  maxAutoIntegrations: 5,
  multiAgentMaintenanceDiscount: 0.1,
  multiAgentSetupDiscount: 0.15,
  aiBudgetByMode: {
    'own-account': 3000,
    'shared-balance': 6000,
    'later': 0,
  },
  individualProductTypes: ['custom', 'consultation'],
};
