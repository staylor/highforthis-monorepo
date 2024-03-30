module.exports = {
  apps: [
    {
      name: 'highforthis-graphql',
      interpreter: './node_modules/.bin/dotenvx',
      interpreter_args: 'run --env-file=.env.production -- node',
      script: 'lib/index.js',
    },
  ],
};
