module.exports = {
  apps: [
    {
      name: 'highforthis-remix',
      interpreter: 'dotenvx run --env-file=.env.production -- node',
      script: 'server.mjs',
    },
  ],
};