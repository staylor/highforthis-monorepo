module.exports = {
  apps: [
    {
      name: 'highforthis-remix',
      interpreter: './node_modules/.bin/dotenvx',
      interpreter_args: 'run --env-file=.env.production -- node',
      script: 'server.js',
    },
  ],
};
