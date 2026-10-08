
// Сохранение и восстановление черновика конструктора. TZ §10.2, §16.
// Обновление страницы не должно приводить к потере черновика.
import type { ConstructorState } from '@/types';
import { getProductById } from '@/config/products';

const STORAGE_KEY = 'nova.constructor.draft';

/** Черновик по умолчанию — пустое состояние конструктора. */
export const DEFAULT_STATE: ConstructorState = {
  productId: null,
  featureIds: [],
  integrationIds: [],
  employeeCount: 1,
  adminCount: 1,
  personalHistory: false,
  personalKnowledgeBase: false,
  sharedCompanyKb: true,
  storageGb: 10,
  storageLargeArchive: false,
  kbManualPreparation: false,
  aiPaymentMode: 'shared-balance',
  publishChannel: null,
  publishText: true,
  publishImage: false,
  publishComments: false,
  publishStats: false,
  publishContentType: null,
  employeeRestrictions: false,
  fileCount: 0,
  customRequirements: '',
};

/** Загружает черновик; в окружениях без localStorage возвращает дефолт. */
export function loadDraft(): ConstructorState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ConstructorState>;
    // Слияние с дефолтом, чтобы новые поля не падали на старых черновиках.
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

/** Сохраняет черновик. Идемпотентен, не бросает при недоступности хранилища. */
export function saveDraft(state: ConstructorState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Хранилище недоступно/переполнено — молча пропускаем, не ломая UI.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Пресет с главной (TZ §4.1 «блок выбора продукта»): выбор продукта на
 * главной странице доносит его в черновик, чтобы конструктор открылся
 * уже с выбранным типом решения. Несовместимые функции/интеграции
 * предыдущего продукта обрезаются (TZ §10.2).
 */
export function presetProduct(productId: string): void {
  if (typeof window === 'undefined') return;
  const product = getProductById(productId);
  if (!product) return;
  const prev = loadDraft();
  saveDraft({
    ...prev,
    productId,
    featureIds: prev.featureIds.filter((f) => product.availableFeatures.includes(f)),
    integrationIds: prev.integrationIds.filter((i) => product.availableIntegrations.includes(i)),
    publishChannel:
      prev.publishChannel && product.availableIntegrations.includes(prev.publishChannel)
        ? prev.publishChannel
        : null,
  });
}
