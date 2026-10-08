
// Экран конструктора. TZ §4.2: шаги 1-7 + финальная конфигурация + заявка.
// Связывает useConstructor, расчёт, пикеры, форму и экран конфигурации.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConstructor } from '@/state/useConstructor';
import { useConstructData } from '@/state/useConstructData';
import { calculatePrice } from '@/domain/pricing';
import { track } from '@/domain/analytics/track';
import { getProductById } from '@/config/products';
import { getIntegrationById } from '@/config/integrations';
import { AI_MODE_LABEL } from '@/config/ai-modes';
import { plural } from '@/domain/text';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductPicker } from '@/components/constructor/ProductPicker';
import { FeaturesPicker } from '@/components/constructor/FeaturesPicker';
import { IntegrationPicker } from '@/components/constructor/IntegrationPicker';
import { PublishingStep } from '@/components/constructor/PublishingStep';
import { TeamStep } from '@/components/constructor/TeamStep';
import { StorageStep } from '@/components/constructor/StorageStep';
import { AiBudgetStep } from '@/components/constructor/AiBudgetStep';
import { PriceSummary } from '@/components/constructor/PriceSummary';
import { FinalConfig } from '@/components/constructor/FinalConfig';
import { LeadForm } from '@/components/constructor/LeadForm';
import type { ConstructorState, Product } from '@/types';

type View = 'edit' | 'config' | 'lead';

interface StepDef {
  id: string;
  title: string;
  done: (state: ConstructorState, product: Product | undefined) => boolean;
}

const STEPS: StepDef[] = [
  { id: 'step-product', title: 'Тип', done: (_s, p) => !!p },
  {
    id: 'step-features',
    title: 'Функции',
    done: (s, p) => !p || s.featureIds.length > 0,
  },
  {
    id: 'step-integrations',
    title: 'Интеграции',
    done: (s) => s.integrationIds.length > 0,
  },
  {
    id: 'step-publishing',
    title: 'Публикация',
    done: (s) => s.publishText || s.publishImage || s.publishComments || s.publishStats,
  },
  { id: 'step-team', title: 'Команда', done: (s) => s.employeeCount >= 1 },
  { id: 'step-storage', title: 'Хранилище', done: (s) => s.storageGb >= 0 },
  { id: 'step-ai', title: 'AI-бюджет', done: (s) => s.aiPaymentMode !== 'later' },
  { id: 'step-total', title: 'Итог', done: () => true },
];

function hasAnySelection(state: ConstructorState): boolean {
  return (
    !!state.productId ||
    state.featureIds.length > 0 ||
    state.integrationIds.length > 0 ||
    state.employeeCount > 1
  );
}

export function ConstructorPage() {
  const { state, set, toggleFeature, toggleIntegration, selectProduct, reset, isPristine } = useConstructor();
  const data = useConstructData();

  const [view, setView] = useState<View>('edit');
  /** Канал формы заявки (TZ §3.5): «заявка» или «отправить менеджеру». */
  const [leadChannel, setLeadChannel] = useState<'lead' | 'manager'>('lead');
  const [resetOpen, setResetOpen] = useState(false);

  // TZ §14: «открытие конструктора» — одно событие на mount экрана.
  useEffect(() => {
    track('constructor_opened');
  }, []);

  // TZ §10.3: подтверждение сброса в модалке (вместо window.confirm).
  // Чистая конфигурация сбрасывается без диалога; reset сам трекает config_reset.
  const confirmReset = () => {
    if (isPristine) return;
    setResetOpen(true);
  };
  const doReset = () => {
    reset();
    setResetOpen(false);
    setView('edit');
  };
  const cancelReset = useCallback(() => setResetOpen(false), []);

  // TZ §14: «переход между шагами» — scrollspy по якорям #step-* в edit-виде.
  // Событие шлём только при реальной смене видимого шага; ref хранит
  // предыдущий, чтобы не дублировать и не заводить side-effect в updater.
  const [activeStep, setActiveStep] = useState<string>(STEPS[0].id);
  const prevStepRef = useRef<string>(STEPS[0].id);
  useEffect(() => {
    if (view !== 'edit') return;
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      const docBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      let current = STEPS[0].id;
      for (const s of STEPS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= mid) current = s.id;
      }
      // До дна — активным считаем последний шаг (Итог).
      if (docBottom) current = STEPS[STEPS.length - 1].id;
      if (current !== prevStepRef.current) {
        prevStepRef.current = current;
        track('step_changed', { to: current });
        setActiveStep(current);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [view]);

  const product = getProductById(state.productId);

  const price = useMemo(
    () =>
      calculatePrice(state, {
        product,
        features: data.features,
        integrations: data.integrations,
        pricing: data.pricing,
      }),
    [state, product, data],
  );

  // Доступные для выбранного продукта каталоги (TZ §3.2 — struct разрешений).
  const allowedFeatures = product
    ? data.features.filter((f) => product.availableFeatures.includes(f.id))
    : [];
  const allowedIntegrations = product
    ? data.integrations.filter((i) => product.availableIntegrations.includes(i.id))
    : [];
  const publishingChannels = allowedIntegrations.filter((i) => i.category === 'publishing');
  const channelTitles: Record<string, string> = {};
  for (const i of allowedIntegrations) channelTitles[i.id] = i.title;

  const goConfig = () => {
    track('step_changed', { to: 'config' });
    setView('config');
  };
  const goLead = () => {
    track('step_changed', { to: 'lead' });
    setLeadChannel('lead');
    setView('lead');
  };
  const goManager = () => {
    track('step_changed', { to: 'lead', channel: 'manager' });
    setLeadChannel('manager');
    setView('lead');
  };
  const goEdit = () => {
    track('step_changed', { to: 'edit' });
    setView('edit');
  };

  const configLines = useMemo(() => buildConfigLines(state, product, allowedIntegrations), [
    state,
    product,
    allowedIntegrations,
  ]);
  const configSummary = useMemo(() => buildSummary(state, product), [state, product]);

  const priceLabel = !hasAnySelection(state)
    ? 'выберите решение'
    : price.requiresIndividualEstimate
      ? 'индивидуальный расчёт'
      : price.firstPeriodTotal !== null
        ? `${price.firstPeriodTotal.toLocaleString('ru-RU')} ₽ за 1-й период`
        : '—';

  return (
    <div className="constructor">
      <div className="constructor-head">
        <h1 className="section-title">Конструктор AI-сервиса</h1>
        <button type="button" className="reset-link" onClick={confirmReset}>
          Сбросить конфигурацию
        </button>
      </div>

      {view === 'edit' && (
        <>
          <nav className="step-bar" aria-label="Шаги конструктора">
            <div className="step-bar-nav">
              {STEPS.map((s, i) => {
                const done = s.done(state, product);
                const active = activeStep === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`step-dot ${done ? 'done' : ''} ${active ? 'current' : ''}`.trim()}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span className="step-dot-num">{done ? '✓' : i + 1}</span>
                    <span className="step-dot-label">{s.title}</span>
                  </a>
                );
              })}
            </div>
            <div className="step-bar-price">
              <span className="muted">Текущий итог</span>
              <span className="text-gold">{priceLabel}</span>
            </div>
          </nav>
          <section id="step-product" className="section">
            <h2 className="section-title">1 · Тип решения</h2>
            <ProductPicker
              products={data.products}
              selectedId={state.productId}
              onSelect={(id) => {
                const p = getProductById(id);
                if (p) {
                  selectProduct(id, {
                    features: p.availableFeatures,
                    integrations: p.availableIntegrations,
                  });
                }
              }}
            />
          </section>

          <section id="step-features" className="section">
            <h2 className="section-title">2 · Функциональность</h2>
            <FeaturesPicker
              features={allowedFeatures}
              selectedIds={state.featureIds}
              onToggle={toggleFeature}
            />
          </section>

          <section id="step-integrations" className="section">
            <h2 className="section-title">3 · Интеграции</h2>
            {allowedIntegrations.length > 0 ? (
              <IntegrationPicker
                integrations={allowedIntegrations}
                selectedIds={state.integrationIds}
                onToggle={toggleIntegration}
              />
            ) : (
              <Card className="step-placeholder">
                <p className="muted">
                  Выберите тип решения — появятся доступные интеграции для этого продукта.
                </p>
              </Card>
            )}
          </section>

          <section id="step-publishing" className="section">
            <h2 className="section-title">4 · Публикация контента</h2>
            <PublishingStep
              state={state}
              set={set}
              availableChannels={publishingChannels.map((i) => i.id)}
              channelTitles={channelTitles}
            />
          </section>

          <section id="step-team" className="section">
            <h2 className="section-title">5 · Сотрудники и доступы</h2>
            <TeamStep state={state} set={set} pricing={data.pricing} />
          </section>

          <section id="step-storage" className="section">
            <h2 className="section-title">6 · Хранилище и база знаний</h2>
            <StorageStep state={state} set={set} pricing={data.pricing} />
          </section>

          <section id="step-ai" className="section">
            <h2 className="section-title">7 · AI-бюджет</h2>
            <AiBudgetStep state={state} set={set} pricing={data.pricing} />
          </section>

          <section id="step-total" className="section">
            <h2 className="section-title">Итог</h2>
            <PriceSummary
              result={price}
              hasProduct={!!product}
              onEdit={goEdit}
              onShowConfig={goConfig}
              onQuote={goLead}
            />
          </section>
        </>
      )}

      {view === 'config' && (
        <div className="section">
          <FinalConfig
            state={state}
            product={product}
            result={price}
            configLines={configLines}
            onGoLead={goLead}
            onGoManager={goManager}
            onGoEdit={goEdit}
          />
        </div>
      )}

      {view === 'lead' && (
        <div className="section">
          <LeadForm
            state={state}
            configSummary={configSummary}
            configLines={configLines}
            channel={leadChannel}
          />
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        title="Сбросить конфигурацию?"
        description="Все выбранные параметры будут удалены. Действие необратимо."
        confirmLabel="Сбросить"
        cancelLabel="Отмена"
        onConfirm={doReset}
        onCancel={cancelReset}
      />
    </div>
  );
}

// ---------- Хелперы отображения конфигурации (обезличенные, TZ §1) ----------
function buildConfigLines(
  state: ConstructorState,
  product: Product | undefined,
  integrations: { id: string; title: string }[],
): string[] {
  const lines: string[] = [];
  lines.push('Тип решения: ' + (product?.title ?? 'не выбрано'));
  if (state.featureIds.length) lines.push('Функции: ' + state.featureIds.length + ' выбрано');
  const intTitles = state.integrationIds
    .map((id) => integrations.find((i) => i.id === id)?.title ?? getIntegrationById(id)?.title ?? id)
    .join(', ');
  const nInt = state.integrationIds.length;
  lines.push(
    `Интеграции: ` + (nInt ? `${nInt} ${plural(nInt, ['интеграция', 'интеграции', 'интеграций'])} — ${intTitles}` : '—'),
  );
  const nEmp = state.employeeCount;
  const nAdmin = state.adminCount;
  lines.push(
    `Сотрудники: ${nEmp} ${plural(nEmp, ['сотрудник', 'сотрудника', 'сотрудников'])}` +
      ` (администраторов: ${nAdmin})` +
      (state.personalHistory ? ', личная история' : '') +
      (state.sharedCompanyKb ? ', общая база компании' : '') +
      (state.employeeRestrictions ? ', ограничения для отдельных сотрудников' : ''),
  );
  lines.push(
    'Хранилище: ' +
      state.storageGb +
      ' ГБ' +
      (state.fileCount > 0 ? `, файлов: ${state.fileCount}` : '') +
      (state.storageLargeArchive ? ' + большие архивы' : '') +
      (state.kbManualPreparation ? ' + ручная подготовка документов' : ''),
  );
  if (state.publishChannel || state.publishContentType) {
    lines.push(
      'Публикация: ' +
        (state.publishContentType ? `контент — ${state.publishContentType}` : 'канал не выбран') +
        (state.publishText ? ' · текст' : '') +
        (state.publishImage ? ' · изображения' : '') +
        (state.publishComments ? ' · комментарии' : '') +
        (state.publishStats ? ' · статистика' : ''),
    );
  }
  lines.push('AI: ' + (AI_MODE_LABEL[state.aiPaymentMode] ?? state.aiPaymentMode));
  if (state.customRequirements.trim()) {
    lines.push('Требования: ' + state.customRequirements.trim());
  }
  return lines;
}

function buildSummary(state: ConstructorState, product: Product | undefined): string {
  const nEmp = state.employeeCount;
  const nInt = state.integrationIds.length;
  return (
    `${product?.title ?? 'Тип решения не выбран'} · ` +
    `${nEmp} ${plural(nEmp, ['сотрудник', 'сотрудника', 'сотрудников'])} · ` +
    `${nInt} ${plural(nInt, ['интеграция', 'интеграции', 'интеграций'])} · ` +
    `хранилище: ${state.storageGb} ГБ · AI: ${AI_MODE_LABEL[state.aiPaymentMode]}`
  );
}
