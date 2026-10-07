// Символ NOVA (брендбук Concept G): ровная (вертикальная) тонкая звезда +
// орбитальное кольцо, слегка наклонённое (-8°), со «спутником-планеткой».
// Saturn-эффект: задняя дуга кольца идёт ЗА звездой, передняя — поверх.
// По последним правкам: звезда крупнее (растянута внутри viewBox),
// кольцо прежнего размера, опущено на ~20 px ещё (25 ед. суммарно).
export function NovaStar({ size = 40, className = '' }: { size?: number; className?: string }) {
  // Наклон кольца -8° вокруг (100,102) + опускание на 25 ед. вниз.
  const ring = 'translate(0 25) rotate(-8 100 102)';
  // Эллипс орбиты: центр (100,102), rx 84, ry 17 — размер не менялся.
  const backArc = 'M 16 102 A 84 17 0 0 1 184 102';
  const frontArc = 'M 184 102 A 84 17 0 0 1 16 102';
  // Звезда: заметно крупнее — 112 ед. по X (44–156), 196 ед. по Y (8–204).
  // Нижняя часть чуть выходит за viewBox — svg имеет overflow: visible.
  const star =
    'M100 8 Q106 100 156 106 Q106 112 100 204 Q94 112 44 106 Q94 100 100 8 Z';
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
