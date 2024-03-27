import cn from 'classnames';
import type { PropsWithChildren, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type ButtonProps = PropsWithChildren<{
  buttonType?: 'primary';
  href?: string;
}> &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, buttonType, href, children, ...props }: ButtonProps) {
  const buttonClass = cn(
    'm-0 inline-block cursor-pointer rounded px-2.5 pb-px align-top',
    'text-sm leading-6 h-7 whitespace-nowrap box-border',
    'border shadow-sm transition-colors active:translate-y-px hover:shadow-md',
    {
      'border-gray-800 bg-gray-800 hover:border-black hover:bg-black text-white':
        buttonType === 'primary',
      'border-gray-400 bg-slate-50 hover:border-gray-600 hover:bg-slate-100':
        buttonType !== 'primary',
    },
    className
  );
  if (href) {
    return (
      <a {...props} className={buttonClass} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" {...props} className={buttonClass}>
      {children}
    </button>
  );
}
