module.exports = {
  apps: [
    {
      name: 'shopify',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5000',
      cwd: '/var/www/shopify/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
