// Символ NOVA (брендбук Concept G): ровная (вертикальная) тонкая звезда +
// орбитальное кольцо, слегка наклонённое (-8°), со «спутником-планеткой».
// Saturn-эффект: задняя дуга кольца идёт ЗА звездой, передняя — поверх.
// По последним правкам: звезда шире в стороны и опущена (ближе к планетке),
// кольцо опущено вниз на ~20 px (12.5 ед. в viewBox 200 на hero-размере 320 px).
export function NovaStar({ size = 40, className = '' }: { size?: number; className?: string }) {
  // Наклон кольца -8° вокруг (100,102) + опускание на 12.5 ед. вниз.
  const ring = 'translate(0 12.5) rotate(-8 100 102)';
  // Эллипс орбиты: центр (100,102), rx 84, ry 17.
  const backArc = 'M 16 102 A 84 17 0 0 1 184 102';
  const frontArc = 'M 184 102 A 84 17 0 0 1 16 102';
  // Звезда: шире в стороны (58–142) и опущена (центр ~108) — ближе к планетке.
  const star =
    'M100 18 Q104 96 142 106 Q104 116 100 198 Q96 116 58 106 Q96 96 100 18 Z';
  return (
    <svg
      className={`nova-star ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Задняя половина орбиты (наклонённая, опущенная) — за звездой */}
      <g transform={ring}>
        <path d={backArc} stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
      </g>
      {/* Звезда (тонкая, вертикальная, шире и ниже) */}
      <path d={star} fill="#F59E0B" />
      {/* Передняя половина орбиты + спутник (наклонённые, опущенные) — поверх звезды */}
      <g transform={ring}>
        <path d={frontArc} stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
        <circle cx="169" cy="112" r="5.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
