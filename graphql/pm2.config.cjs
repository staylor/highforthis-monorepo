module.exports = {
  apps: [
    {
      name: 'highforthis-graphql',
      script: 'lib/index.js',
      node_args: '--env-file-if-exists=.env.production',
    },
  ],
};
