import env from '#/env';

const resolvers = {
  Query: {
    // Public: only keys meant for browsers belong here
    apiKeys() {
      return {
        googleMaps: env.GOOGLE_MAPS_BROWSER_API_KEY,
      };
    },
  },
};

export default resolvers;
