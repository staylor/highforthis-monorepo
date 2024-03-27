
const resolvers = {
  Query: {
    apiKeys() {
      return {
        googleMaps: process.env.GOOGLE_MAPS_GEOLOCATION_API_KEY,
      };
    },
  },
};

export default resolvers;
