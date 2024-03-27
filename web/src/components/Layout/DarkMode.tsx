import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import { getItem, setItem, removeItem } from '@/utils/storage';

const STORAGE_KEY = 'darkMode';

export default function DarkMode() {
  const [checked, setChecked] = useState(false);
  const setDark = () => {
    setItem(STORAGE_KEY, '1');
    document.documentElement.classList.add('dark');
    setChecked(true);
  };
  const removeDark = () => {
    removeItem(STORAGE_KEY);
    document.documentElement.classList.remove('dark');
    setChecked(false);
  };

  const onChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      setDark();
    } else {
      removeDark();
    }
  };

  useEffect(() => {
    if (getItem(STORAGE_KEY)) {
      setDark();
    }
  }, []);

  return (
    <div className="mx-5 my-2 flex items-center justify-center">
      <label className="relative inline-block h-9 w-16" htmlFor="checkbox">
        <input
          type="checkbox"
          id="checkbox"
          className="peer hidden"
          onClick={onChange}
          onChange={() => null}
          checked={checked}
        />
        <div
          className={cn(
            'bg-detail peer-checked:bg-detail-dark absolute inset-0 cursor-pointer rounded-full duration-500',
            'before:absolute before:left-1 before:bottom-1 before:h-7 before:w-7 before:rounded-full before:bg-white before:duration-500',
            'peer-checked:before:translate-x-7'
          )}
        />
      </label>
      <span className="sr-only">Enable Dark Mode!</span>
    </div>
  );
}
