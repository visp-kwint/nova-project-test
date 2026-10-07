// Символ NOVA (брендбук Concept G): ровная (вертикальная) тонкая звезда +
// орбитальное кольцо, слегка наклонённое (-8°, как в nova-symbol.svg), со
// «спутником-планеткой». Saturn-эффект: верхняя (задняя) дуга кольца идёт ЗА
// звездой, нижняя (передняя) — поверх неё. Наклон применяется только к кольцу
// и спутнику, звезда остаётся строго вертикальной.
export function NovaStar({ size = 40, className = '' }: { size?: number; className?: string }) {
  // Эллипс орбиты: центр (100,102), rx 84, ry 17. Наклон -8° вокруг (100,102).
  const tilt = 'rotate(-8 100 102)';
  // Задняя (верхняя) дуга — от левого конца через верх к правому.
  const backArc = 'M 16 102 A 84 17 0 0 1 184 102';
  // Передняя (нижняя) дуга — от правого конца через низ к левому.
  const frontArc = 'M 184 102 A 84 17 0 0 1 16 102';
  return (
    <svg
      className={`nova-star ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Задняя половина орбиты (наклонённая) — за звездой */}
      <g transform={tilt}>
        <path d={backArc} stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
      </g>
      {/* Звезда (тонкая, вертикальная, из nova-symbol.svg) */}
      <path
        d="M100 6 Q102 90 132 100 Q102 110 100 194 Q98 110 68 100 Q98 90 100 6 Z"
        fill="#F59E0B"
      />
      {/* Передняя половина орбиты + спутник (наклонённые) — поверх звезды */}
      <g transform={tilt}>
        <path d={frontArc} stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
        <circle cx="169" cy="112" r="5.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
