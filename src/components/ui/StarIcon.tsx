
// Малая 4-лучевая звезда NOVA (без кольца) — акцент в CTA-кнопке и полосе под hero.
// Растёт от currentColor, чтобы наследовать цвет (золото / мист).
export function StarIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`star-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2 Q13.2 10.8 22 12 Q13.2 13.2 12 22 Q10.8 13.2 2 12 Q10.8 10.8 12 2 Z"
        fill="currentColor"
      />
    </svg>
  );
}
