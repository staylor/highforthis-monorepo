export default {
  apps: [
    {
      name: 'highforthis-remix',
      script: './server.mjs',
      env: {
        NODE_ENV: 'production',
        GQL_HOST: 'http://localhost:8084',
        SERVER_PORT: 3006,
        TOKEN_KEY: 'draftAuthToken',
        TOKEN_SECRET: 'pizza69hair',
      },
    },
  ],
};
