module.exports = {
    apps: [
        {
            name: "shopify",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 5000",
            cwd: "/var/www/shopify/web",
            instances: 1,
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 5000,
            },
            max_memory_restart: "1G",
	    listen_timeout: 10000,
            kill_timeout: 5000,
            exp_backoff_restart_delay: 100,
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        }
    ]
};
