import { cn } from '../public/cn.ts';

export const inputBase =
  'my-1 mr-1 last:mr-0 rounded-md border-gray-300 shadow-xs focus:border-pink focus:ring-3 focus:ring-pink-200 transition-colors';

export const heading1 = 'font-black uppercase text-2xl lg:text-3xl';

export const buttonClass = (primary?: boolean, extra?: string) =>
  cn(
    'm-0 inline-block cursor-pointer rounded px-2.5 pb-px align-top no-underline',
    'text-sm leading-6 h-7 whitespace-nowrap box-border',
    'border shadow-xs transition-colors active:translate-y-px hover:shadow-md',
    primary
      ? 'border-gray-800 bg-gray-800 text-white visited:text-white hover:border-black hover:bg-black'
      : 'border-gray-400 bg-slate-50 hover:border-gray-600 hover:bg-slate-100',
    extra
  );
