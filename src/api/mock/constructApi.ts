
// Mock API для локальной разработки. TZ §16: «заявка отправляется в backend
// или демонстрационный mock API». Имитирует сетевую задержку.
import type { ConstructApi, DraftRecord } from '@/api/client';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Хранилище черновиков в памяти (аналог серверной стороны для mock).
const drafts = new Map<string, DraftRecord>();

export const mockConstructApi: ConstructApi = {
  async getProducts() {
    await delay(150);
    // В mock возвращаем из config, чтобы не дублировать данные.
    const { PRODUCTS } = await import('@/config/products');
    return PRODUCTS as unknown as unknown[];
  },
  async getFeatures() {
    await delay(150);
    const { FEATURES } = await import('@/config/features');
    return FEATURES as unknown as unknown[];
  },
  async getIntegrations() {
    await delay(150);
    const { INTEGRATIONS } = await import('@/config/integrations');
    return INTEGRATIONS as unknown as unknown[];
  },
  async getPricingConfig() {
    await delay(100);
    const { PRICING_CONFIG } = await import('@/config/pricing-config');
    return { pricing: PRICING_CONFIG };
  },
  async validate(payload) {
    await delay(200);
    // Простая server-side проверка: продукт выбран.
    const errors = payload.state.productId ? [] : ['Выберите тип решения.'];
    return { ok: errors.length === 0, errors };
  },
  async submitLead(payload) {
    await delay(400);
    // В mock не пишем реальную ПДн на сервер — только обезличенный id.
    void payload;
    return { ok: true, id: `lead-${Date.now()}` };
  },
  async saveDraft(state) {
    await delay(100);
    const record: DraftRecord = {
      id: 'local',
      state,
      savedAt: new Date().toISOString(),
    };
    drafts.set(record.id, record);
    return record;
  },
  async loadDraft(id) {
    await delay(100);
    const record = drafts.get(id);
    if (!record) throw new Error(`Draft ${id} not found`);
    return record;
  },
};
