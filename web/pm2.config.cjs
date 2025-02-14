module.exports = {
  apps: [
    {
      name: 'highforthis-remix',
      interpreter: './node_modules/.bin/dotenvx',
      interpreter_args: 'run --env-file=.env.production -- tsx',
      script: 'server.ts',
    },
  ],
};
