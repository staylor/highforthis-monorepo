import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';

import Input from './Input';

export default function LoginForm() {
  const { t } = useTranslation();
  return (
    <Form className="mt-5 block p-6 text-sm shadow-2xl" method="post">
      <label className="tracking-wide" htmlFor="email">
        {t('login.email')}
        <Input type="text" name="email" />
      </label>
      <label className="tracking-wide" htmlFor="password">
        {t('login.password')}
        <Input type="password" name="password" />
      </label>
      <button
        className="border-detail box-border h-7 cursor-pointer appearance-none rounded border bg-white px-3 pb-0.5 align-baseline text-sm"
        type="submit"
      >
        {t('login.button')}
      </button>
    </Form>
  );
}
