# NOVA — конструктор frontend для AI-сервисов

Фронтенд-конструктор для сборки, настройки и предварительного расчёта
AI-сервисов (ТЗ: `TZ_dlya_frontend.md`). Стена NOVA: тёмная палитра +
Nova Gold (брендбук в `lI8G....jpg`).

Стек: React + TypeScript + Vite + react-router + zod (валидация).

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + сборка
npm test           # unit-тесты (vitest)
```

Без `VITE_API_BASE_URL` работает **mock API** (`src/api/mock`); с URL —
реальный backend по контракту из ТЗ §13.

## Структура

```
src/
  types/          # доменные типы (Product, Feature, Integration, State, PriceResult)
  config/         # каталоги и админ-конфигурация: products, features,
                  # integrations, pricing-config (тарифы только здесь — ТЗ §5)
  domain/
    pricing/      # чистый модуль расчёта стоимости (без JSX)
    validation/   # zod-схема заявки + проверка состояния
    draft/        # черновик в localStorage (TЗ §10.2)
    analytics/    # события + фильтрация приватных полей (TЗ §14)
  api/            # клиент + mock (TЗ §13, §16)
  state/          # useConstructor: стейт, авто-сохранение, трек
  components/
    ui/           # примитивы: Card, Button, Badge, Toggle
    layout/       # Header, Footer
    constructor/  # ProductPicker, IntegrationPicker, PriceSummary
  pages/          # HomePage, ConstructorPage
  styles/         # theme.css (токены NOVA), global.css, components.css
```

## Ключевые правила из ТЗ

- Тарифы и интеграции — только через `config/`, не хардкод в компонентах (§5).
- Расчёт — чистая функция `domain/pricing`, не в JSX (§11).
- Состояние переживает refresh: автосохранение черновика (§10.2).
- В аналитику не попадают ПДн/ключи/токены: `sanitizeProps` (§14).
- Индивидуальные услуги помечены бейджем «Индивидуальный расчёт» (§6.2).
- Все данные обезличенные (§1).

## Переменные окружения

| Переменная            | Назначение                         |
|-----------------------|------------------------------------|
| `VITE_API_BASE_URL`   | URL backend; пусто => mock API     |

См. `.env.example`.

## Изменение тарифов

Все цены и пороги живут в одном файле — `src/config/pricing-config.ts`
(объект `PRICING_CONFIG`, административная конфигурация расчёта). В UI
цены не зашиты: компоненты берут значения только из этой конфигурации.

| Поле                          | Что меняет                                              |
|-------------------------------|---------------------------------------------------------|
| `perExtraEmployee`            | доплата за каждого дополнительного сотрудника, ₽/мес   |
| `perExtraAdmin`               | доплата за каждого дополнительного администратора, ₽/мес |
| `includedStorageGb`           | объём бесплатного хранилища, ГБ                         |
| `perExtraStorageGb`           | доплата за каждый дополнительный ГБ, ₽/мес               |
| `integrationLevels.basic/.standard/.advanced` | стоимость подключения и сопровождения по уровню интеграции (setup + monthly) |
| `maxAutoIntegrations`         | порог: при большем числе авто-интеграций расчёт уходит в индивидуальный |
| `multiAgentMaintenanceDiscount` / `multiAgentSetupDiscount` | пакетная скидка для комплектных продуктов (0–1) |
| `aiBudgetByMode`              | ориентировочный месячный бюджет AI по способу оплаты (обезличенная оценка) |
| `individualProductTypes`      | типы продуктов, которые всегда уходят в индивидуальный расчёт |

Цены конкретных каталогов (базовая цена продукта, стоимость интеграций) — в
`src/config/products.ts` и `src/config/integrations.ts`. В продакшене вся эта
конфигурация подгружается с backend по `GET /api/construct/pricing-config`
и может меняться без пересборки фронтенда. После правок локальной
конфигурации достаточно перезапустить `npm run dev`.

## Пример обезличенных тестовых данных

Каталоги `src/config/products.ts`, `src/config/features.ts`,
`src/config/integrations.ts` и `src/config/pricing-config.ts` —
демонстрационные обезличенные данные (NOVA, круглые суммы-заглушки).
Их же используют unit-тесты `src/domain/pricing/pricing.test.ts`
и mock API `src/api/mock/constructApi.ts`.
