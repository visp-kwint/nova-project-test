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
