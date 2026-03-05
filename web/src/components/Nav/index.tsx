import cn from 'classnames';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import type { Location } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

import Select from '#/components/Form/Select';

import DarkMode from '../Layout/DarkMode';

import Link from './Link';

const year = new Date().getFullYear() + 1;
const yearChoices = (start: number, end: number) =>
  [...Array(end - start).keys()].map((i) => start + i);

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
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen } = useContext(MobileMenuContext);

  const onChange = (value: string) => {
    navigate({
      pathname: `/videos/${value}`,
    });
  };
  const showYears = location.pathname === '/' || location.pathname.match(/^\/video/);

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
        {showYears && (
          <Select
            value=""
            className={cn('dark:text-dark mx-auto my-0 md:mx-0')}
            placeholder={t('nav.videosByYear')}
            choices={yearChoices(2011, year).reverse()}
            onChange={onChange}
          />
        )}
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
            {showYears && (
              <Select
                value=""
                className="dark:text-dark mt-2"
                placeholder={t('nav.videosByYear')}
                choices={yearChoices(2011, year).reverse()}
                onChange={onChange}
              />
            )}
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
