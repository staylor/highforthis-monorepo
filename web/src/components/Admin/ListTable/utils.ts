import { useSearchParams } from 'react-router';

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

export const useUpdateQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    updateQuery: (key: string) => (value: string) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
      searchParams.delete('page');
      setSearchParams(searchParams);
    },
    searchParams,
  };
};
