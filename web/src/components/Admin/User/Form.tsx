import { gql } from 'graphql-tag';

import { Heading } from '@/components/Admin/styles';
import Form from '@/components/Admin/Form';
import Message from '@/components/Form/Message';
import type { Fields } from '@/types';
import type { User } from '@/types/graphql';

interface UserFormProps {
  data?: User;
  heading: string;
  buttonLabel: string;
}

const userFields: Fields = [
  { label: 'Name', prop: 'name' },
  { label: 'Email', prop: 'email', inputType: 'email', autoComplete: false },
  { label: 'Password', prop: 'password', inputType: 'password', autoComplete: false },
  {
    label: 'Bio',
    prop: 'bio',
    type: 'textarea',
  },
  {
    label: 'Roles',
    prop: 'roles',
    type: 'select',
    choices: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
    ],
    multiple: true,
  },
];

function UserForm({ data = {} as User, heading, buttonLabel }: UserFormProps) {
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text="User updated." />
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
