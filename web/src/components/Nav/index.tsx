import cn from 'classnames';
import type { Location } from '@remix-run/react';
import { useLocation, useNavigate } from '@remix-run/react';

import Select from '@/components/Form/Select';

import Link from './Link';

const year = new Date().getFullYear() + 1;
const yearChoices = (start: number, end: number) =>
  [...Array(end - start).keys()].map((i) => start + i);

const showsIsActive = (_: string, location: Location) =>
  !!location.pathname.match(/^\/(shows|venue|artist)/);

const Navigation = () => {
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
        'mx-auto mt-2 mb-3 text-center md:my-3 lg:mx-0 lg:mt-0 lg:text-left',
        'md:flex md:items-center md:justify-start lg:h-12'
      )}
    >
      <Link to="/">Home</Link>
      <Link to="/podcast">Podcast</Link>
      <Link to="/shows" isActive={showsIsActive}>
        Shows
      </Link>
      <Link to="/videos">Videos</Link>
      {showYears && (
        <Select
          value=""
          className="mx-auto my-0 dark:text-dark md:mx-0"
          placeholder="-- Videos By Year --"
          choices={yearChoices(2011, year).reverse()}
          onChange={onChange}
        />
      )}
    </nav>
  );
};

export default Navigation;
