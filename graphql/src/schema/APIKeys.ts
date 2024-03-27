const APIKeys = `#graphql
  type APIKeys {
    googleMaps: String
  }

  extend type Query {
    apiKeys: APIKeys
  }
`;

export default APIKeys;
