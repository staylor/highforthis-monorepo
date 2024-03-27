import cn from 'classnames';
import type { SyntheticEvent } from 'react';
import { useSearchParams } from '@remix-run/react';

interface MessageProps {
  dismissable?: boolean;
  text?: string;
  param?: string;
}

export default function Message({
  dismissable = true,
  text = '',
  param = 'message',
}: MessageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentParam = searchParams.get(param) || '';
  if (!text || (dismissable && !currentParam)) {
    return null;
  }
  let message = text;
  if (dismissable && text.includes('%s')) {
    message = text.replace('%s', currentParam);
  }
  const onClick = (e: SyntheticEvent) => {
    e.preventDefault();

    searchParams.delete(param);
    setSearchParams(searchParams);
  };

  return (
    <div
      className={cn(
        'border-pink border-l-4 bg-neutral-50 shadow-sm',
        'relative mb-4 mt-1 block py-px pr-9 pl-3'
      )}
    >
      <p className="my-2 p-0.5 text-sm text-dark">{message}</p>
      {dismissable && (
        <button
          type="button"
          className={cn(
            'm-0 cursor-pointer border-none bg-none p-2',
            'absolute right-1 top-0',
            'dashicons-before before:content-dismiss before:text-base',
            'before:block before:h-5 before:w-5 before:bg-none'
          )}
          onClick={onClick}
        />
      )}
    </div>
  );
}
