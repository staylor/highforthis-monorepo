import { gql } from 'graphql-tag';

export const userFormFragment = gql`
  fragment UserForm_user on User {
    bio
    email
    id
    name
    roles
  }
`;
