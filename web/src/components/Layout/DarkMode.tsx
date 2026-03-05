import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getItem, setItem, removeItem } from '#/utils/storage';

const STORAGE_KEY = 'darkMode';

export default function DarkMode() {
  const { t } = useTranslation();
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
    <div className="flex items-center">
      <label
        className="relative inline-block h-6 w-12"
        htmlFor="checkbox"
        aria-label={t('nav.darkMode')}
      >
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
            'absolute inset-0 cursor-pointer rounded-full border transition-colors duration-300',
            'border-neutral-200 bg-neutral-200',
            'dark:bg-surface-dark-card dark:border-white/10',
            'before:absolute before:bottom-0.5 before:left-0.5 before:h-5 before:w-5',
            'before:rounded-full before:bg-white before:shadow-sm before:transition-transform before:duration-300',
            'peer-checked:before:translate-x-6',
            'peer-checked:before:bg-pink'
          )}
        />
      </label>
      <span className="sr-only">{t('nav.darkMode')}</span>
    </div>
  );
}
