import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';

const pad = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

export const formatDate = (date: string | number) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const min = d.getMinutes();
  const hour = d.getHours();
  return `${pad(month)}/${pad(day)}/${d.getFullYear()}
  ${' at '}
  ${hour % 12}:${pad(min)}${hour < 12 ? 'am' : 'pm'}`;
};

export const usePath = () => {
  const location = useLocation();
  const paginated = location.pathname.indexOf('/page');
  return paginated === -1 ? location.pathname : location.pathname.slice(0, paginated);
};

export const useUpdateQuery = () => {
  const path = usePath();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return {
    updateQuery: (key: string) => (value: string) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
      const qs = searchParams.toString();
      navigate(qs ? `${path}?${qs}` : path);
    },
    searchParams,
  };
};
