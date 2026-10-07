// Русские склонения счётных слов. UI: «1 интеграция», «2 интеграции», «5 интеграций».
// Чистая функция без зависимостей — используется в шагах конструктора и итогах.

/** Возвращает форму множественного числа: [0, 1, 2, 5]. 0 — ноль, 1 — один. */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (d > 1 && d < 5) return forms[1];
  if (d === 1) return forms[0];
  return forms[2];
}

/** Форматирует «N × X ₽/мес» (пункт 6): строка сотрудников/админов в расчёте. */
export function monthlyRow(count: number, unitPrice: number): string {
  return `${count} × ${unitPrice.toLocaleString('ru-RU')} ₽/мес`;
}
