import cn from 'classnames';

export const modalClass = cn(
  'bg-white border-2 border-dark fixed z-top',
  'inset-2 p-4 sm:inset-[10%] sm:p-7'
);

export const frameClass = cn(
  'absolute overflow-auto after:clear-both after:table',
  'inset-x-4 top-12 bottom-4 sm:top-7.5 sm:right-10 sm:bottom-10 sm:left-7.5'
);

export const itemTitleClass = cn('block text-sm overflow-hidden text-ellipsis whitespace-nowrap');
