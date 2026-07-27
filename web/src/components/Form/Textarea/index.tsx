import cn from 'classnames';
import type { TextareaHTMLAttributes, ChangeEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { inputBase } from '#/components/Form/styles';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (value: string) => void;
  /** grow to fit the content instead of scrolling, so long values wrap into view */
  autoGrow?: boolean;
  /** wrap visually, but never allow an actual line break in the value */
  singleLine?: boolean;
}

export default function Textarea({
  autoGrow = false,
  singleLine = false,
  onChange,
  onKeyDown,
  className,
  value,
  ...props
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!autoGrow || !el) {
      return;
    }
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow]);

  // size on mount, when the value changes, and as the viewport reflows
  useEffect(() => {
    resize();
    if (!autoGrow) {
      return;
    }
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [autoGrow, resize, value]);

  const onInput = () => {
    const el = ref.current;
    // catches pasted line breaks too, since a paste fires `input`
    if (singleLine && el?.value.includes('\n')) {
      el.value = el.value.replace(/\s*\n+\s*/g, ' ');
    }
    resize();
  };

  const inputOnKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  const inputOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!onChange) {
      return;
    }
    const newValue = e.target.value || '';
    onChange(newValue);
  };

  return (
    <textarea
      {...props}
      ref={ref}
      onInput={autoGrow || singleLine ? onInput : undefined}
      onKeyDown={singleLine || onKeyDown ? inputOnKeyDown : undefined}
      onChange={onChange ? inputOnChange : undefined}
      className={cn(inputBase, 'w-full', { 'resize-none overflow-hidden': autoGrow }, className)}
      defaultValue={value}
    />
  );
}
