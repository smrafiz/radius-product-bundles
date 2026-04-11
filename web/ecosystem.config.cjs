module.exports = {
    apps: [
        {
            name: "shopify",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 5000",
            cwd: "/var/www/shopify/web",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 5000,
            },
            max_memory_restart: "1G",
            error_file: "/var/log/pm2/shopify-error.log",
            out_file: "/var/log/pm2/shopify-out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        },
    ],
};
