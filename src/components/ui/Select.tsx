
// Кастомный Select в стиле NOVA: тёмная «пилюля», своя стрелка, собственный
// выпадающий список (без синего системного дропдауна).
// Детали:
//  - placeholder («Не выбран») — только отображение пустого значения триггера,
//    он НЕ дублируется отдельной строкой в списке;
//  - компоненту передают уже сформированные варианты (пустое состояние
//    экрана решает родитель — например, PublishingStep показывает блок
//    «Сначала выберите тип решения» вместо select).
// Accessible: role=listbox, закрытие по Esc / клику вне.
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Текст пустого значения триггера, обычно «Не выбран». */
  placeholder?: string;
  label?: string;
}

export function Select({
  id,
  value,
  onChange,
  options,
  placeholder = 'Не выбран',
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const realOptions = options.filter((o) => o.value !== '');
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  // Пустое значение — текст триггера приглушён.
  const isPlaceholder = !selected;

  return (
    <div className="nova-select" ref={rootRef}>
      {label ? <span className="field-label">{label}</span> : null}
      <button
        id={id}
        type="button"
        className={`nova-select-trigger ${isPlaceholder ? 'is-placeholder' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nova-select-value">{selected?.label ?? placeholder}</span>
        <svg
          className="nova-select-chevron"
          width="14"
          height="9"
          viewBox="0 0 14 9"
          aria-hidden="true"
        >
          <path
            d="M1.5 2.75 7 7.75l5.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul className="nova-select-list" role="listbox" aria-label={label}>
          {realOptions.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              className={`nova-select-option ${o.value === value ? 'is-selected' : ''} ${
                o.disabled ? 'is-disabled' : ''
              }`}
              onClick={() => {
                if (o.disabled) return;
                pick(o.value);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
