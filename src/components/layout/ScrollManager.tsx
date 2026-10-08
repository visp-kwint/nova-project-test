
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Памятка скролла по маршрутам: позиция каждой страницы запоминается и
 * восстанавливается при возврате (window.scroll общий на все роуты —
 * листание «Услуг» не должно сдвигать «Процесс» и наоборот).
 *
 * Правила:
 * - первый визит (позиции ещё не было) → к верху;
 * - возврат → к запомненной позиции;
 * - refresh / прямой URL → браузер сам восстановил позицию, не перебиваем;
 * - якоря (#cases, #about, #step-*) → плавный scrollIntoView к элементу.
 *
 * Как запоминается:
 * - ОДИН глобальный scroll-слушатель (на всю жизнь компонента) пишет
 *   window.scrollY под ТЕКУЩИМ маршрутом (ref `currentPath`, переводится
 *   синхронно в useLayoutEffect — раньше, чем обработаются события).
 *   Записи идут только под ключ текущего маршрута, поэтому уходящая
 *   страница не перезаписывает память возвращаемой.
 * - Почему не записываем позицию «на момент ухода» (prev-route save):
 *   при подмене DOM браузер синхронно сжимает scrollY под новую высоту,
 *   и к layout-моменту истинное значение уходящей страницы уже потеряно —
 *   сохранение запомнило бы чужое clamped-число. Непрерывная запись
 *   во время нахождения на странице — единственный надёжный источник.
 * - Сразу после восстановления позиции (restore) записи подавляются на
 *   SUPPRESS_MS: кламп-событие от пережатого scrollY не должно
 *   «запомнить» случайную промежуточную точку.
 * - rAF-ловля намеренно НЕ используется: в фоновых/эмулируемых вкладках
 *   кадры троттлятся, и память бы не обновлялась.
 */

// Окно подавления записей после навигации: кламп-событие приходит в
// первые кадры подмены DOM (≈2-3 кадра). 100 мс — запас без заметной
// потери реальных скроллов пользователя.
const SUPPRESS_MS = 100;

export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const positions = useRef<Record<string, number>>({});
  // Текущий маршрут — ключ записи. Обновляется синхронно в layout-эффекте,
  // до того, как обработаются любые scroll-события (layout бегут до paint).
  const currentPath = useRef(pathname);
  const suppressUntil = useRef(0);
  // Первый проход layout-эффекта = стартовая загрузка (refresh / URL).
  const firstRun = useRef(true);

  // Непрерывная фиксация позиции ТЕКУЩЕЙ страницы (колесо, клавиатура,
  // программный скролл). Одно attach на жизнь компонента.
  useEffect(() => {
    const record = () => {
      // Кламп-события сразу после навигации не записываем.
      if (performance.now() < suppressUntil.current) return;
      positions.current[currentPath.current] = window.scrollY;
    };
    window.addEventListener('scroll', record, { passive: true });
    return () => {
      window.removeEventListener('scroll', record);
    };
  }, []);

  // При смене маршрута: перевести ключ записи + восстановить позицию.
  useLayoutEffect(() => {
    currentPath.current = pathname;

    if (firstRun.current) {
      // refresh / прямой URL: не перебиваем нативное восстановление
      // браузера (браузер сам откатил scrollY к сохранёной позиции).
      firstRun.current = false;
      return;
    }
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        // Якорные переходы (шапка, step-bar) — плавно к элементу.
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    // Возврат → к памяти; первый визит (позиции нет) → к верху.
    // Глобальный scroll-behavior:smooth отключён — без «долетания».
    const target = positions.current[pathname] ?? 0;
    window.scrollTo(0, target);
    // Подавить кламп-события, которые придут от пережатого scrollY.
    suppressUntil.current = performance.now() + SUPPRESS_MS;
  }, [pathname, hash]);

  return null;
}
