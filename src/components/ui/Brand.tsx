// Wordmark в шапке (брендбук): только надпись NOVA — без звезды, искры и теглайна.
import { Link } from 'react-router-dom';

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="NOVA — на главную">
      <span className="brand-text">
        <span className="brand-name">NOVA</span>
      </span>
    </Link>
  );
}
