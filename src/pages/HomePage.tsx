
// Главная страница. ТЗ §4.1 + брендбук NOVA (п.3, п.10: полоса из трёх пунктов,
// карточки готовых конфигураций, FAQ).
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NovaStar } from '@/components/ui/NovaStar';
import { PRODUCTS } from '@/config/products';

// Полоса из трёх пунктов под hero (п.3 брендбука).
const STRIP = [
  {
    num: '01',
    title: 'Предварительный расчёт',
    text: 'Стоимость запуска и обслуживания — до заказа, без скрытых доплат.',
  },
  {
    num: '02',
    title: 'Готовые коннекторы',
    text: 'Мессенджеры, почта, CMS и CRM подключаются без ручного кода.',
  },
  {
    num: '03',
    title: 'Запуск в 30 дней',
    text: 'Старт типового решения — от 30 дней, сопровождение включено.',
  },
];

// Карточки готовых конфигураций (п.10): берутся из каталога продуктов.
const READY_CONFIGS = [
  {
    key: 'edu',
    tag: 'Образование',
    title: 'Образовательный AI-помощник',
    productId: 'edu-assistant',
    lines: ['1 агент · мессенджер + почта', 'БАЗа знаний и поиск'],
  },
  {
    key: 'smm',
    tag: 'Маркетинг',
    title: 'AI-SMM-ассистент для команды',
    productId: 'smm-assistant',
    lines: ['Контент-план · 3 сотрудника', 'Соцсети и статистика'],
  },
  {
    key: 'corp',
    tag: 'Корпоративный',
    title: 'Корпоративный помощник (комплект)',
    productId: 'corp-assistant',
    lines: ['2 агента · общая БАЗа компании', 'CRM и расширенный мессенджер'],
  },
];

// FAQ (п.10) — раскрывающиеся блоки.
const FAQ = [
  {
    q: 'Что входит в стоимость запуска?',
    a: 'Настройка выбранного AI-агента, подключение готовых коннекторов, загрузка подготовленных материалов, базовая инструкция и ограниченное число раундов правок. Индивидуальные работы — отдельно, с пометкой «Индивидуальный расчёт».',
  },
  {
    q: 'Как считается ежемесячное обслуживание?',
    a: 'Базовое обслуживание выбранного продукта + доплаты за дополнительных сотрудников, хранилище сверх включённого объёма и сопровождение подключённых интеграций. Первый администратор включён в базовый тариф.',
  },
  {
    q: 'Что такое «Индивидуальный расчёт»?',
    a: 'Нестандартная логика, создание нового коннектора, интеграция с нестандартной CRM, большие архивы и голосовые сценарии оцениваются вручную. Конструктор честно помечает такие элементы и отправляет заявку менеджеру.',
  },
  {
    q: 'Сколько стоит использование AI?',
    a: 'Расходы на AI зависят от нагрузки: количество запросов, размер документов, поиск, генерация изображений и внешних инструментов. Ориентир — в шаге 7 конструктора, безлимит по умолчанию не заявляется.',
  },
  {
    q: 'Что нужно подготовить для запуска?',
    a: 'Подготовленные текстовые материалы, доступы к каналам (бот-токены, аккаунты CMS/CRM) и согласие на обработку данных. Полный чек-лист менеджер пришлёт после заявки.',
  },
];

export function HomePage() {
  const priceOf = (productId: string) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return null;
    return p.basePrice > 0
      ? `от ${p.basePrice.toLocaleString('ru-RU')} ₽`
      : 'по запросу';
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Практичный ИИ · измеримый результат</p>
          <h1 className="hero-title">
            Практичный ИИ.{' '}
            <span className="text-gold">Измеримый результат в 30 дней.</span>
          </h1>
          <p className="hero-sub">
            Соберите AI-сервис под свою задачу: выберите продукт, интеграции и сотрудников —
            конструктор рассчитает стоимость запуска и обслуживания в реальном времени.
          </p>
          <div className="hero-cta">
            <Link to="/constructor">
              <Button variant="primary">Открыть конструктор</Button>
            </Link>
            <Link to="/constructor">
              <Button variant="outline">Стратегический звонок</Button>
            </Link>
          </div>
        </div>
        <div className="hero-symbol" aria-hidden>
          <NovaStar size={320} />
        </div>
        {/* Часть планеты: дуга горизонта внизу + атмосферное свечение (референс, секция 10) */}
        <div className="hero-planet" aria-hidden>
          <span className="hero-planet-glow" />
        </div>
      </section>

      {/* Полоса из трёх пунктов (п.3) */}
      <div className="hero-strip">
        {STRIP.map((s) => (
          <div key={s.num} className="hero-strip-item">
            <span className="hero-strip-num">{s.num}</span>
            <div>
              <strong>{s.title}</strong>
              <p className="muted">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="section">
        <h2 className="section-title">Готовые конфигурации</h2>
        <div className="example-grid">
          {READY_CONFIGS.map((c) => (
            <Card key={c.key} className="example-card">
              <span className="example-tag">{c.tag}</span>
              <h3>{c.title}</h3>
              <ul className="product-capabilities">
                {c.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <div className="example-price">
                {priceOf(c.productId)}
                <small>к запуску + сопровождение</small>
              </div>
            </Card>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Не нашли подходящий состав?{' '}
          <Link to="/constructor">
            <Button variant="ghost">Собрать свой в конструкторе →</Button>
          </Link>
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Вопросы и ответы</h2>
        <div className="faq-list">
          {FAQ.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <div className="faq-answer">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Модель оплаты</h2>
        <p className="muted">
          Разовый запуск + ежемесячное обслуживание. Первый администратор и базовое хранилище —
          включены в базовый тариф. Расходы на AI оцениваются отдельно и зависят от нагрузки.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Дисклеймер</h2>
        <p className="muted">
          Расчёты в конструкторе носят предварительный характер. Итоговая стоимость подтверждается
          в коммерческом предложении.
        </p>
      </section>
    </div>
  );
}

