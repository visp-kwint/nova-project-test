
import type { InputHTMLAttributes } from 'react';

// Переключатель-чекбокс для простых да/нет (личный доступ, личная БЗ и т.д.).
export function Toggle(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className="ui-toggle" {...props} />;
}
