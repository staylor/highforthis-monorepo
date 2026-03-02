module.exports = {
  apps: [
    {
      name: 'highforthis-remix',
      script: 'server.js',
      node_args: '--env-file-if-exists=.env.production',
    },
  ],
};
