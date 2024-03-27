import type { InputHTMLAttributes } from 'react';

const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="mb-5 mr-1.5 mt-0.5 box-border w-full rounded border border-gray-300 bg-gray-50 p-2 text-2xl shadow-sm outline-none transition focus:border-gray-400 focus:shadow-lg"
  />
);

export default Input;
