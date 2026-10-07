
// Модуль расчёта стоимости. TZ §5. Чистая бизнес-логика — никакого JSX.
// Все тарифы берутся из PricingConfig (TZ §5: конфигурация, не хардкод).
import type {
  ConstructorState,
  Feature,
  Integration,
  PriceBreakdown,
  PriceLineItem,
  PriceResult,
  Product,
} from '@/types';
import type { PricingConfig } from '@/config/pricing-config';
import { monthlyRow, plural } from '@/domain/text';

type ReadonlyCatalog<T> = readonly T[];

const levelKey = (level: Integration['level']) => {
  switch (level) {
    case 1:
      return 'basic';
    case 2:
      return 'standard';
    case 3:
      return 'advanced';
    case 'individual':
      return null;
  }
};

const round = (n: number) => Math.round(n);

/** Переводит состояние и выбранные сущности в итоговый расчёт. TZ §5. */
export function calculatePrice(
  state: ConstructorState,
  ctx: {
    product?: Product;
    features: ReadonlyCatalog<Feature>;
    integrations: ReadonlyCatalog<Integration>;
    pricing: PricingConfig;
  },
): PriceResult {
  const { product, features, integrations, pricing } = ctx;
  const warnings: string[] = [];
  const individualItems: string[] = [];
  const lineItems: PriceLineItem[] = [];

  if (!product) {
    return emptyResult(warnings, lineItems);
  }

  // Индивидуальный продукт сразу уходит в ручную оценку (TZ §5.5, §6.2).
  if (pricing.individualProductTypes.includes(product.type)) {
    warnings.push('Для данного продукта требуется индивидуальная оценка.');
    individualItems.push(product.title);
    return withIndividual(emptyResult(warnings, lineItems), individualItems, warnings);
  }

  const selectedFeatures: Feature[] = features.filter((f) => state.featureIds.includes(f.id));
  const selectedIntegrations: Integration[] = integrations.filter((i) =>
    state.integrationIds.includes(i.id),
  );

  // ---------- Функции ----------
  let featuresSetup = 0;
  let featuresMonthly = 0;
  for (const f of selectedFeatures) {
    if (f.requiresIndividualEstimate) {
      individualItems.push(f.title);
      continue;
    }
    featuresSetup += f.price;
    featuresMonthly += f.monthlyPrice ?? 0;
    if (f.price > 0) {
      lineItems.push({
        label: f.title,
        kind: 'setup',
        value: f.price,
        note: f.monthlyPrice ? `+ ${f.monthlyPrice.toLocaleString('ru-RU')} ₽/мес` : undefined,
      });
    }
  }

  // ---------- Интеграции (TZ §5.4: каждая точка — отдельная интеграция) ----------
  let integrationsSetup = 0;
  let integrationsMonthly = 0;
  let autoIntegrations = 0;
  let individualIntegrations = 0;
  for (const it of selectedIntegrations) {
    if (it.requiresIndividualEstimate || it.level === 'individual') {
      individualItems.push(it.title);
      individualIntegrations += 1;
      lineItems.push({ label: it.title, kind: 'individual', value: 0, note: 'индивидуальный расчёт' });
      continue;
    }
    autoIntegrations += 1;
    const key = levelKey(it.level);
    const setup = it.setupPrice ?? (key ? pricing.integrationLevels[key].setup : 0);
    const monthly = it.monthlyPrice ?? (key ? pricing.integrationLevels[key].monthly : 0);
    integrationsSetup += setup;
    integrationsMonthly += monthly;
    lineItems.push({
      label: it.title,
      kind: 'setup',
      value: setup,
      note: monthly > 0 ? `+ ${monthly.toLocaleString('ru-RU')} ₽/мес` : undefined,
    });
  }

  // Порог авто-расчёта (TZ §5.5, §5): из конфига.
  const thresholdHit = autoIntegrations > pricing.maxAutoIntegrations;
  if (thresholdHit) {
    warnings.push(
      `Для данной конфигурации требуется индивидуальная оценка. Оставьте заявку, ` +
        `чтобы получить расчёт стоимости и сроков.`,
    );
    individualItems.push(
      `${selectedIntegrations.length} интеграций — свыше порога ${pricing.maxAutoIntegrations}`,
    );
  }

  // ---------- Сотрудники и админы (TZ §5.3: первый админ в базе, без двойной оплаты) ----------
  // Первый администратор включён в базовый тариф и не оплачивается ни как сотрудник,
  // ни как админ. Остальные люди делятся на два непересекающихся пула:
  //   • не-админские места  — (employeeCount - adminCount) × perExtraEmployee;
  //   • дополнительные админы — (adminCount - 1) × perExtraAdmin (цена «за админа» целиком).
  // Таким образом ни один админ не оплачивается дважды (п.7).
  const extraNonAdmin = Math.max(0, state.employeeCount - state.adminCount);
  const extraAdmins = Math.max(0, state.adminCount - 1);
  const extraEmployeesMonthly = extraNonAdmin * pricing.perExtraEmployee;
  const extraAdminsMonthly = extraAdmins * pricing.perExtraAdmin;
  if (extraEmployeesMonthly > 0) {
    lineItems.push({
      label: monthlyRow(extraNonAdmin, pricing.perExtraEmployee),
      kind: 'monthly',
      value: extraEmployeesMonthly,
      note: `${extraNonAdmin} ${plural(extraNonAdmin, ['сотрудник', 'сотрудника', 'сотрудников'])}`,
    });
  }
  if (extraAdminsMonthly > 0) {
    lineItems.push({
      label: monthlyRow(extraAdmins, pricing.perExtraAdmin),
      kind: 'monthly',
      value: extraAdminsMonthly,
      note: `${extraAdmins} ${plural(extraAdmins, ['доп. администратор', 'доп. администратора', 'доп. администраторов'])}`,
    });
  }

  // ---------- Хранилище (TZ §4.2) ----------
  const extraStorageGb = Math.max(0, state.storageGb - pricing.includedStorageGb);
  const extraStorageMonthly = extraStorageGb * pricing.perExtraStorageGb;
  if (extraStorageMonthly > 0) {
    lineItems.push({
      label: `Дополнительное хранилище (+${extraStorageGb} ГБ)`,
      kind: 'monthly',
      value: extraStorageMonthly,
      note: `${pricing.perExtraStorageGb.toLocaleString('ru-RU')} ₽/ГБ`,
    });
  }
  // Большие архивы / нестандартный импорт → индивидуальный расчёт (TZ §6.2).
  if (state.storageLargeArchive) {
    individualItems.push('Обработка больших архивов / нестандартный импорт');
  }

  // ---------- Пакетная скидка (TZ §5.2) ----------
  const isMultiAgent = product.type === 'multi-agent' || product.agentCount >= 2;
  const maintenanceDiscount = isMultiAgent ? pricing.multiAgentMaintenanceDiscount : 0;
  const setupDiscount = isMultiAgent ? pricing.multiAgentSetupDiscount : 0;

  const rawSetup = product.basePrice + featuresSetup + integrationsSetup;
  const rawMonthly =
    product.monthlyPrice +
    featuresMonthly +
    integrationsMonthly +
    extraEmployeesMonthly +
    extraAdminsMonthly +
    extraStorageMonthly;

  // Итоговые суммы: если есть индивидуальный расчёт — точные значения нельзя.
  const individual = thresholdHit || individualItems.length > 0;
  const setupPrice = individual ? null : round(rawSetup * (1 - setupDiscount));
  const monthlyPrice = individual ? null : round(rawMonthly * (1 - maintenanceDiscount));
  // ИТОГО за первый период (TZ §3.4): запуск + первый месяц обслуживания.
  const firstPeriodTotal =
    individual ? null : round(rawSetup * (1 - setupDiscount) + rawMonthly * (1 - maintenanceDiscount));

  const breakdown: PriceBreakdown = {
    productBase: product.basePrice,
    featuresSetup,
    featuresMonthly,
    integrationsSetup,
    integrationsMonthly,
    extraEmployeesMonthly,
    extraAdminsMonthly,
    extraStorageMonthly,
    maintenanceDiscount: maintenanceDiscount * 100,
  };

  // AI-бюджет (не входит в итог, отдельная строка, TZ §3.4).
  const aiBudgetEstimate = pricing.aiBudgetByMode[state.aiPaymentMode] ?? 0;

  return {
    setupPrice,
    monthlyPrice,
    firstPeriodTotal,
    aiBudgetEstimate,
    requiresIndividualEstimate: individual,
    breakdown,
    lineItems,
    warnings,
    individualItems,
  };
}

function emptyResult(warnings: string[], lineItems: PriceLineItem[]): PriceResult {
  return {
    setupPrice: null,
    monthlyPrice: null,
    firstPeriodTotal: null,
    aiBudgetEstimate: null,
    requiresIndividualEstimate: false,
    breakdown: {
      productBase: 0,
      featuresSetup: 0,
      featuresMonthly: 0,
      integrationsSetup: 0,
      integrationsMonthly: 0,
      extraEmployeesMonthly: 0,
      extraAdminsMonthly: 0,
      extraStorageMonthly: 0,
      maintenanceDiscount: 0,
    },
    lineItems,
    warnings,
    individualItems: [],
  };
}

function withIndividual(
  r: PriceResult,
  items: string[],
  warnings: string[],
): PriceResult {
  return {
    ...r,
    setupPrice: null,
    monthlyPrice: null,
    firstPeriodTotal: null,
    requiresIndividualEstimate: true,
    individualItems: items,
    warnings,
  };
}
