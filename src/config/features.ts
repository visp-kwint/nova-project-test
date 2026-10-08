
// Обезличенный каталог функций. В продакшене: GET /api/construct/features
// со struct разрешений на продукт (TZ §3.2, §12).
import type { Feature } from '@/types';

export const FEATURES: readonly Feature[] = [
  {
    id: 'gen-text',
    title: 'Генерация текста',
    description: 'Написание ответов, описаний и материалов.',
    category: 'generation',
    price: 0,
  },
  {
    id: 'gen-images',
    title: 'Генерация изображений',
    description: 'Создание готовых иллюстраций и обложек.',
    category: 'generation',
    price: 12000,
    monthlyPrice: 2000,
  },
  {
    id: 'plans',
    title: 'Планы и задания',
    description: 'Подготовка учебных планов и практических заданий.',
    category: 'knowledge',
    price: 8000,
  },
  {
    id: 'content-plan',
    title: 'Контент-план',
    description: 'Автоматическое планирование публикаций по календарю.',
    category: 'publishing',
    price: 10000,
    monthlyPrice: 1500,
  },
  {
    id: 'kb-search',
    title: 'База знаний и поиск',
    description: 'Загрузка документов и ответы по вашей базе знаний.',
    category: 'knowledge',
    price: 0,
    // price = 0 ⇒ «включено в тариф»: без доплат, иначе расчёт и UI расходятся.
  },
  {
    id: 'doc-search',
    title: 'Поиск по документам',
    description: 'Точечный поиск по загруженным файлам и выжимки.',
    category: 'knowledge',
    price: 6000,
  },
  {
    id: 'inbound-analysis',
    title: 'Анализ входящих сообщений',
    description: 'Автоматическая классификация и выжимка входящих обращений и писем.',
    category: 'communication',
    price: 7000,
    monthlyPrice: 900,
  },
  {
    id: 'responses',
    title: 'Ответы на обращения',
    description: 'Автоматические ответы на входящие сообщения.',
    category: 'communication',
    price: 0,
  },
  {
    id: 'publish',
    title: 'Публикация материалов',
    description: 'Автопубликация в выбранные каналы.',
    category: 'publishing',
    price: 5000,
    monthlyPrice: 1000,
  },
  {
    id: 'comment-reply',
    title: 'Работа с комментариями',
    description: 'Ответы на комментарии в соцсетях.',
    category: 'publishing',
    price: 0,
    // price = 0 ⇒ «включено в тариф»: без доплат, иначе расчёт и UI расходятся.
  },
  {
    id: 'analytics',
    title: 'Сбор статистики',
    description: 'Аналитика публикаций и вовлечённости аудитории.',
    category: 'publishing',
    price: 4000,
    monthlyPrice: 1200,
  },
  {
    id: 'multi-employee',
    title: 'Несколько сотрудников',
    description: 'Раздельные рабочие места и доступы для команды.',
    category: 'communication',
    price: 0,
  },
  {
    id: 'custom-scenario',
    title: 'Индивидуальные сценарии',
    description: 'Не типовая логика под ваш процесс.',
    category: 'advanced',
    price: 0,
    requiresIndividualEstimate: true,
  },
  {
    id: 'video-gen',
    title: 'Генерация видео',
    description: 'Создание видеоматериалов — нестандартная услуга, оценивается вручную.',
    category: 'advanced',
    price: 0,
    requiresIndividualEstimate: true,
  },
  {
    id: 'voice-calls',
    title: 'Голосовые звонки / телефония',
    description: 'Входящие и исходящие голосовые сценарии, работа с телефонией.',
    category: 'advanced',
    price: 0,
    requiresIndividualEstimate: true,
  },
] as const;

export const getFeatureById = (id: string): Feature | undefined =>
  FEATURES.find((f) => f.id === id);
