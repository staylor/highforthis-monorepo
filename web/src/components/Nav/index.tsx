import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import type { Location } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

import Select from '~/components/Form/Select';

import Link from './Link';

const year = new Date().getFullYear() + 1;
const yearChoices = (start: number, end: number) =>
  [...Array(end - start).keys()].map((i) => start + i);

const showsIsActive = (_: string, location: Location) =>
  !!location.pathname.match(/^\/(shows|venue|artist)/);

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const onChange = (value: string) => {
    navigate({
      pathname: `/videos/${value}`,
    });
  };
  const showYears = location.pathname === '/' || location.pathname.match(/^\/video/);
  return (
    <nav
      className={cn(
        'mx-auto mb-3 mt-2 text-center md:my-3 lg:mx-0 lg:mt-0 lg:text-left',
        'md:flex md:items-center md:justify-start lg:h-12'
      )}
    >
      <Link to="/">{t('nav.home')}</Link>
      <Link to="/podcast">{t('nav.podcast')}</Link>
      <Link to="/shows" isActive={showsIsActive}>
        {t('nav.shows')}
      </Link>
      <Link to="/videos">{t('nav.videos')}</Link>
      {showYears && (
        <Select
          value=""
          className="dark:text-dark mx-auto my-0 md:mx-0"
          placeholder={t('nav.videosByYear')}
          choices={yearChoices(2011, year).reverse()}
          onChange={onChange}
        />
      )}
    </nav>
  );
};

export default Navigation;
