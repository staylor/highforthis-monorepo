import { Form } from '@remix-run/react';

import Input from './Input';

export default function LoginForm() {
  return (
    <Form className="mt-5 block p-6 text-sm shadow-2xl" method="post">
      <label className="tracking-wide" htmlFor="email">
        Email
        <Input type="text" name="email" />
      </label>
      <label className="tracking-wide" htmlFor="password">
        Password
        <Input type="password" name="password" />
      </label>
      <button
        className="box-border h-7 cursor-pointer appearance-none rounded border border-detail bg-white px-3 pb-0.5 align-baseline text-sm"
        type="submit"
      >
        Log In
      </button>
    </Form>
  );
}
