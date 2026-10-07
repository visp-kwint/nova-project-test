
// Шапка (брендбук, секция 10): логотип слева, навигация + CTA справа.
// Меню на русском (задача #5).
import { Link, useLocation } from 'react-router-dom';
import { Brand } from '@/components/ui/Brand';

const NAV = [
  { label: 'Услуги', to: '/' },
  { label: 'Процесс', to: '/constructor' },
  { label: 'Кейсы', to: '/' },
  { label: 'О нас', to: '/' },
];

export function Header() {
  const { pathname } = useLocation();
  const isConstructor = pathname.startsWith('/constructor');
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand tagline />
        <nav className="site-nav" aria-label="Основная навигация">
          {NAV.map((n) => {
            const active = isConstructor ? n.to === '/constructor' : n.label === 'Услуги' && !isConstructor;
            return (
              <Link key={n.label} to={n.to} className={active ? 'nav-link active' : 'nav-link'}>
                {n.label}
              </Link>
            );
          })}
          <Link to="/constructor" className="nav-cta">Контакт</Link>
        </nav>
      </div>
    </header>
  );
}
