import cn from 'classnames';
import type { KeyboardEvent, SyntheticEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Input from '#/components/Form/Input';
import Icon from '#/components/Icon';

interface TagsProps {
  name: string;
  tags?: string[];
}

export default function Tags({ name, tags }: TagsProps) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<string[]>(tags || []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const newTags = [...pending];
      const input = e.target as HTMLInputElement;
      newTags.push(input.value);
      const unique = [...new Set(newTags)];
      setPending(unique);
    }
  };

  const bindClick = (index: number) => (e: SyntheticEvent) => {
    e.preventDefault();

    const newTags = [...pending];
    newTags.splice(index, 1);
    setPending(newTags);
  };

  return (
    <>
      <Input placeholder={t('tags.placeholder')} onKeyDown={onKeyDown} />
      <div className="my-1.5 overflow-auto text-xs">
        {pending.map((tag, i) => (
          <div
            className="float-left mr-1.5 max-w-full cursor-default overflow-hidden text-sm text-ellipsis"
            key={tag}
          >
            <input type="hidden" name={name} value={tag} />
            <button
              type="button"
              aria-label={t('tags.remove', { tag })}
              className={cn(
                'float-left mr-0.5 flex h-5 w-5 cursor-pointer items-center justify-center',
                'text-dark rounded-full transition-colors hover:bg-neutral-200'
              )}
              onClick={bindClick(i)}
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>{' '}
            {tag}
          </div>
        ))}
      </div>
    </>
  );
}
