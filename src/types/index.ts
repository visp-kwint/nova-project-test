// Доменные типы конструктора (обезличенные). См. TZ §12.
export * from './analytics';

export type ProductType =
  | 'single-agent'
  | 'multi-agent'
  | 'custom'
  | 'consultation';

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  description: string;
  /** Ключевые возможности (для карточки продукта). */
  capabilities: string[];
  /** Стоимость запуска, ₽ (разово). */
  basePrice: number;
  /** Базовое ежемесячное обслуживание, ₽/мес. */
  monthlyPrice: number;
  /** Сколько AI-агентов в комплекте (0 = индивидуальное/консультация). */
  agentCount: number;
  /** Доступные функции для этого продукта (разрешения из backend, TZ §3.2). */
  availableFeatures: string[];
  /** Доступные интеграции для этого продукта (TZ §12). */
  availableIntegrations: string[];
}

export type FeatureCategory =
  | 'generation'
  | 'knowledge'
  | 'publishing'
  | 'communication'
  | 'advanced';

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  /** Разовая доплата к запуску, ₽. */
  price: number;
  /** Доплата к ежемесячному обслуживанию, ₽/мес (0 если нет). */
  monthlyPrice?: number;
  /** Требует индивидуального расчёта (не входит в авто-расчёт). */
  requiresIndividualEstimate?: boolean;
}

export type IntegrationCategory =
  | 'communication'
  | 'publishing'
  | 'email'
  | 'external'
  | 'custom';

/** 1 = базовый, 2 = стандартный, 3 = расширенный. */
export type IntegrationLevel = 1 | 2 | 3;

export interface Integration {
  id: string;
  title: string;
  category: IntegrationCategory;
  level: IntegrationLevel | 'individual';
  setupPrice?: number;
  monthlyPrice?: number;
  description: string;
  /** Возможные ограничения / что нужно предоставить. */
  limits?: string[];
  requirements?: string[];
  available: boolean;
  requiresIndividualEstimate: boolean;
  /** Наличие готового коннектора. */
  readyConnector?: boolean;
}

export type AiPaymentMode = 'own-account' | 'shared-balance' | 'later';

/** Состояние конструктора. Персистится в localStorage (черновик). */
export interface ConstructorState {
  productId: string | null;
  featureIds: string[];
  integrationIds: string[];
  /** Общее число сотрудников (первый администратор включён в базовый тариф). */
  employeeCount: number;
  /** Количество администраторов (первый включён в базу, §4.2). */
  adminCount: number;
  personalHistory: boolean;
  personalKnowledgeBase: boolean;
  sharedCompanyKb: boolean;
  /** Объём хранилища, ГБ. */
  storageGb: number;
  /** Обработка больших архивов / нестандартный импорт — индивидуальный расчёт. */
  storageLargeArchive: boolean;
  /** Ручная подготовка документов (TZ §4.2, §6.2 — индивидуальный расчёт). */
  kbManualPreparation: boolean;
  aiPaymentMode: AiPaymentMode;
  // Публикация контента (§4.2 «Публикация контента»).
  publishChannel: string | null;
  publishText: boolean;
  publishImage: boolean;
  publishComments: boolean;
  publishStats: boolean;
  /** Свободные требования (не передаются в аналитику). */
  customRequirements: string;
  /** Тип публикуемого содержимого (§4.2 «Публикация контента»). */
  publishContentType: string | null;
  /** Ограничения для отдельных сотрудников (§4.2 «Сотрудники и доступы»). */
  employeeRestrictions: boolean;
  /** Количество файлов в базе знаний (§4.2 «Хранилище и база знаний»). */
  fileCount: number;
}

export interface PriceBreakdown {
  productBase: number;
  featuresSetup: number;
  featuresMonthly: number;
  integrationsSetup: number;
  integrationsMonthly: number;
  extraEmployeesMonthly: number;
  extraAdminsMonthly: number;
  extraStorageMonthly: number;
  maintenanceDiscount: number;
}

/** Детальная строка расчёта для итогового блока (TZ §3.4). */
export interface PriceLineItem {
  label: string;
  kind: 'setup' | 'monthly' | 'individual';
  value: number;
  note?: string;
}

export interface PriceResult {
  setupPrice: number | null;
  monthlyPrice: number | null;
  /** Итог за первый период: запуск + первый месяц (§3.4). null если индивидуальный. */
  firstPeriodTotal: number | null;
  aiBudgetEstimate: number | null;
  requiresIndividualEstimate: boolean;
  breakdown: PriceBreakdown;
  /** Детальные строки: интеграции, сотрудники, хранилище, функции. */
  lineItems: PriceLineItem[];
  warnings: string[];
  /** Названия услуг, ушедших в индивидуальный расчёт. */
  individualItems: string[];
}
