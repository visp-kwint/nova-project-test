// Unit-тесты модуля расчёта (TZ §5). Чистая бизнес-логика — без JSX.
import { describe, it, expect } from 'vitest';
import { calculatePrice } from '@/domain/pricing';
import { PRODUCTS, getProductById } from '@/config/products';
import { FEATURES } from '@/config/features';
import { INTEGRATIONS } from '@/config/integrations';
import { PRICING_CONFIG } from '@/config/pricing-config';
import type { ConstructorState } from '@/types';

const state = (patch: Partial<ConstructorState> = {}): ConstructorState => ({
  productId: 'edu-assistant',
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
  ...patch,
});

const ctx = (id?: string | null) => ({
  product: id === undefined ? getProductById('edu-assistant') : getProductById(id ?? null),
  features: FEATURES,
  integrations: INTEGRATIONS,
  pricing: PRICING_CONFIG,
});

describe('calculatePrice', () => {
  it('нет продукта — пустой расчёт', () => {
    const r = calculatePrice(state({ productId: null }), ctx(null));
    expect(r.setupPrice).toBeNull();
    expect(r.requiresIndividualEstimate).toBe(false);
  });

  it('базовый продукт: запуск = basePrice, месячное = monthlyPrice', () => {
    const r = calculatePrice(state(), ctx());
    const p = PRODUCTS.find((x) => x.id === 'edu-assistant')!;
    expect(r.setupPrice).toBe(p.basePrice);
    expect(r.monthlyPrice).toBe(p.monthlyPrice);
    expect(r.firstPeriodTotal).toBe(p.basePrice + p.monthlyPrice);
  });

  it('первый админ не оплачивается (TZ §5.3): 2 сотрудника, 1 админ → доплата 1 × perExtraEmployee', () => {
    const r = calculatePrice(state({ employeeCount: 2, adminCount: 1 }), ctx());
    expect(r.breakdown.extraAdminsMonthly).toBe(0);
    expect(r.breakdown.extraEmployeesMonthly).toBe(PRICING_CONFIG.perExtraEmployee);
  });

  it('доп. админ оплачивается один раз, без двойного счёта (п.7): 3 сотрудника, 2 админа', () => {
    const r = calculatePrice(state({ employeeCount: 3, adminCount: 2 }), ctx());
    // не-админских мест: 3 - 2 = 1 × perExtraEmployee
    expect(r.breakdown.extraEmployeesMonthly).toBe(PRICING_CONFIG.perExtraEmployee);
    // доп. админов: 2 - 1 = 1 × perExtraAdmin
    expect(r.breakdown.extraAdminsMonthly).toBe(PRICING_CONFIG.perExtraAdmin);
    // строки в «N × X ₽/мес»
    const labels = r.lineItems.map((l) => l.label);
    expect(labels).toContain(
      `1 × ${PRICING_CONFIG.perExtraEmployee.toLocaleString('ru-RU')} ₽/мес`,
    );
    expect(labels).toContain(
      `1 × ${PRICING_CONFIG.perExtraAdmin.toLocaleString('ru-RU')} ₽/мес`,
    );
  });

  it('все — админы: 4 сотрудника, 4 админа → доп. админов 3, не-админов 0', () => {
    const r = calculatePrice(state({ employeeCount: 4, adminCount: 4 }), ctx());
    expect(r.breakdown.extraEmployeesMonthly).toBe(0);
    expect(r.breakdown.extraAdminsMonthly).toBe(3 * PRICING_CONFIG.perExtraAdmin);
  });

  it('интеграции считаются по явным ценам (свои setupPrice/monthlyPrice)', () => {
    const r = calculatePrice(
      state({ integrationIds: ['messenger-basic', 'email-inbox'] }),
      ctx(),
    );
    const p = getProductById('edu-assistant')!;
    const expectedSetup = p.basePrice + 9000 + 15000;
    const expectedMonthly = p.monthlyPrice + 1500 + 2000;
    expect(r.setupPrice).toBe(expectedSetup);
    expect(r.monthlyPrice).toBe(expectedMonthly);
    expect(r.firstPeriodTotal).toBe(expectedSetup + expectedMonthly);
  });

  it('большие архивы → индивидуальный расчёт', () => {
    const r = calculatePrice(state({ storageLargeArchive: true }), ctx());
    expect(r.requiresIndividualEstimate).toBe(true);
    expect(r.setupPrice).toBeNull();
  });

  it('порог авто-интеграций → индивидуальный расчёт (из конфига)', () => {
    const ids = INTEGRATIONS.filter((i) => !i.requiresIndividualEstimate).slice(0, 6).map((i) => i.id);
    const r = calculatePrice(state({ integrationIds: ids }), ctx());
    expect(r.requiresIndividualEstimate).toBe(true);
    expect(r.warnings.some((w) => w.includes('индивидуальная оценка'))).toBe(true);
  });

  it('включённые (бесплатные) функции не меняют цену и не блокируются', () => {
    const base = calculatePrice(state(), ctx());
    const withIncluded = calculatePrice(state({ featureIds: ['gen-text', 'responses', 'kb-search'] }), ctx());
    // бесплатные функции (price = 0) не добавляют в итог
    expect(withIncluded.setupPrice).toBe(base.setupPrice);
  });

  it('пакетная скидка для комплектов из 2+ агентов', () => {
    const r = calculatePrice(state({ productId: 'corp-assistant' }), ctx('corp-assistant'));
    const p = getProductById('corp-assistant')!;
    expect(r.setupPrice).toBe(
      Math.round(p.basePrice * (1 - PRICING_CONFIG.multiAgentSetupDiscount)),
    );
  });
});
