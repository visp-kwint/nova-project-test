// Символ NOVA — новое лого (nova-logo/new-nova-logo.jpg):
// 4-лучевая вытянутая звезда (вертикальные лучи ~4× горизонтальных, острые кончики),
// градиент: светлый центр → оранжевые кончики. Тонкое белое кольцо-орбита
// (вид сбоку, без наклона), Saturn-эффект: верх кольца за звездой, низ — поверх.
// Спутник — маленькая белая точка справа-внизу, на кольце.
// Откат к старой геометрии: git checkout 65e9a8f -- src/components/ui/NovaStar.tsx
export function NovaStar({ size = 40, className = '' }: { size?: number; className?: string }) {
  // Кольцо: горизонтальный эллипс, центр (100,102), rx 77, ry 15 (сужено по п. от пользователя).
  const backArc = 'M 23 102 A 77 15 0 0 1 177 102'; // верхняя дуга — за звездой
  const frontArc = 'M 177 102 A 77 15 0 0 1 23 102'; // нижняя дуга — поверх звезды
  // Звезда: вертикаль 8–196 (188 ед.), горизонталь 76–124 (48 ед.) — ~4:1,
  // острые кончики (контрольные точки близко к центру).
  const star = 'M100 8 Q104 98 124 102 Q104 106 100 196 Q96 106 76 102 Q96 98 100 8 Z';
  // Спутник на переднем (нижнем) витке кольца: точка эллипса при t≈30°
  // → x = 100 + 77·cos30 ≈ 166.7, y = 102 + 15·sin30 ≈ 109.5.
  return (
    <svg
      className={`nova-star ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="nova-star-grad" cx="100" cy="102" r="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset="0.35" stopColor="#FCD34D" />
          <stop offset="1" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      {/* Задняя (верхняя) половина орбиты — за звездой */}
      <path d={backArc} stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
      {/* Звезда (вытянутая, с градиентом от светлого центра к оранжевым кончикам) */}
      <path d={star} fill="url(#nova-star-grad)" />
      {/* Передняя (нижняя) половина орбиты + спутник — поверх звезды */}
      <path d={frontArc} stroke="#E2E8F0" strokeWidth="2.4" fill="none" />
      <circle cx="166.7" cy="109.5" r="5.5" fill="#FFFFFF" />
    </svg>
  );
}
