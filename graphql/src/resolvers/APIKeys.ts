import env from '#/env';

const resolvers = {
  Query: {
    apiKeys() {
      return {
        googleMaps: env.GOOGLE_MAPS_GEOLOCATION_API_KEY,
      };
    },
  },
};

export default resolvers;
