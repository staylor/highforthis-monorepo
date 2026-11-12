import type { CSSProperties } from 'react';

export const setStyle = (
  ref: React.MutableRefObject<HTMLElement | null>,
  styles: CSSProperties
) => {
  if (!ref?.current) {
    return;
  }

  Object.keys(styles).forEach((cssKey) => {
    const key = cssKey as keyof CSSProperties;
    // @ts-expect-error todo todo
    (ref.current as HTMLElement).style[key] = styles[key];
  });
};
