// Полный lockup NOVA (брендбук Concept G): тонкая звезда + wordmark NOVA + искра.
// Композиция 1:1 из nova-logo/nova-logo-horizontal.svg.
import { Link } from 'react-router-dom';
import { NovaStar } from './NovaStar';

export function Brand({ to = '/', tagline = false }: { to?: string; tagline?: boolean }) {
  return (
    <Link to={to} className="brand" aria-label="NOVA — на главную">
      <NovaStar size={46} />
      <span className="brand-text">
        <span className="brand-name">
          NOVA
          <svg className="brand-sparkle" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 1 Q10.4 8 14 10 Q10.4 12 10 19 Q9.6 12 6 10 Q9.6 8 10 1 Z"
              fill="currentColor"
            />
          </svg>
        </span>
        {tagline ? (
          <span className="brand-tag">AI-агентство для предпринимателей и фрилансеров</span>
        ) : null}
      </span>
    </Link>
  );
}
