import cn from 'classnames';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import type { Location } from 'react-router';
import { useLocation } from 'react-router';

import DarkMode from '../Layout/DarkMode';

import Link from './Link';

const showsIsActive = (_: string, location: Location) =>
  !!location.pathname.match(/^\/(shows|venue|artist)/);

const MobileMenuContext = createContext({
  isOpen: false,
  toggle: () => {},
});

export function MobileMenuProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <MobileMenuContext.Provider value={{ isOpen, toggle }}>{children}</MobileMenuContext.Provider>
  );
}

const Navigation = () => {
  const { t } = useTranslation();
  const { isOpen } = useContext(MobileMenuContext);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-8 lg:flex">
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/podcast">{t('nav.podcast')}</Link>
        <Link to="/shows" isActive={showsIsActive}>
          {t('nav.shows')}
        </Link>
        <Link to="/videos">{t('nav.videos')}</Link>
      </nav>

      {/* Mobile nav overlay */}
      {isOpen && (
        <nav
          className={cn(
            'absolute top-full right-4 z-50 w-56 rounded-xl lg:hidden',
            'dark:bg-surface-dark border border-neutral-200 bg-white shadow-lg dark:border-white/10',
            'px-5 py-5'
          )}
        >
          <div className="flex flex-col gap-4">
            <Link to="/">{t('nav.home')}</Link>
            <Link to="/podcast">{t('nav.podcast')}</Link>
            <Link to="/shows" isActive={showsIsActive}>
              {t('nav.shows')}
            </Link>
            <Link to="/videos">{t('nav.videos')}</Link>
            <div className="mt-2">
              <DarkMode />
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

function MobileToggle() {
  const { t } = useTranslation();
  const { isOpen, toggle } = useContext(MobileMenuContext);

  return (
    <button
      type="button"
      className="flex items-center lg:hidden"
      onClick={toggle}
      aria-label={t('nav.menu')}
      aria-expanded={isOpen}
    >
      <svg
        className="h-6 w-6 text-neutral-700 dark:text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}

Navigation.MobileToggle = MobileToggle;

export default Navigation;
