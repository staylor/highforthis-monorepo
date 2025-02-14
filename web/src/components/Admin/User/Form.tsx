import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import { Heading } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Fields } from '~/types';
import type { User } from '~/types/graphql';

interface UserFormProps {
  data?: User;
  heading: string;
  buttonLabel: string;
}

function UserForm({ data = {} as User, heading, buttonLabel }: UserFormProps) {
  const { t } = useTranslation();
  const userFields: Fields = [
    { label: t('users.name'), prop: 'name' },
    { label: t('users.email'), prop: 'email', inputType: 'email', autoComplete: false },
    { label: t('users.password'), prop: 'password', inputType: 'password', autoComplete: false },
    {
      label: t('users.bio'),
      prop: 'bio',
      type: 'textarea',
    },
    {
      label: t('users.roles.label'),
      prop: 'roles',
      type: 'select',
      choices: [
        { label: t('users.roles.admin'), value: 'admin' },
        { label: t('users.roles.editor'), value: 'editor' },
      ],
      multiple: true,
    },
  ];

  return (
    <>
      <Heading>{heading}</Heading>
      <Message text={t('users.updated')} />
      <Form data={data} fields={userFields} buttonLabel={buttonLabel} />
    </>
  );
}

UserForm.fragments = {
  user: gql`
    fragment UserForm_user on User {
      bio
      email
      id
      name
      roles
    }
  `,
};

export default UserForm;
