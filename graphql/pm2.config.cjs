module.exports = {
  apps: [
    {
      name: 'highforthis-graphql',
      interpreter: 'dotenvx run --env-file=.env.production -- node',
      script: 'lib/index.js',
    },
  ],
};
