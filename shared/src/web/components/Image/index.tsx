import type { HTMLProps } from 'react';

function Image({ src, alt, className, ...props }: HTMLProps<HTMLImageElement>) {
  return (
    <img key={src} src={src} alt={alt} className={className || 'mb-4'} loading="lazy" {...props} />
  );
}

export default Image;
