import { gql } from 'graphql-tag';

export const showFormFragment = gql`
  fragment ShowForm_show on Show {
    artists {
      id
      name
    }
    attended
    date
    id
    notes
    title
    url
    venue {
      id
      name
    }
  }
`;

export const showFormEntitiesFragment = gql`
  fragment ShowForm_entities on Query {
    artists(filtered: true, first: 500) @cache(key: "admin") {
      edges {
        node {
          id
          name
        }
      }
    }
    venues(filtered: true, first: 500) @cache(key: "admin") {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;
