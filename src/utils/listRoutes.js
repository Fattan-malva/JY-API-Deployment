const chalk = require('chalk');

const listRoutes = (app) => {
    console.log(chalk.cyan.bold('\n📋 Registered Routes:\n'));

    const cleanPath = (regex) => {
        return regex
            .toString()
            .replace(/^\/\^/, '')
            .replace(/\\\//g, '/')
            .replace(/\(\?\=\\\/\|\$\)/, '')
            .replace(/\?\(\=\.\*\)\$/, '')
            .replace(/\?\(\=\.\*\)/, '')
            .replace(/\$$/, '')
            .replace(/\/i$/, '')
            .replace(/\?.*/, '')
            .replace(/\/$/, '')
            .trim();
    };

    // Warna method HTTP
    const colorMethod = (method) => {
        switch (method) {
            case 'GET': return chalk.greenBright(method.padEnd(6));
            case 'POST': return chalk.blueBright(method.padEnd(6));
            case 'PUT': return chalk.yellowBright(method.padEnd(6));
            case 'DELETE': return chalk.redBright(method.padEnd(6));
            default: return chalk.white(method.padEnd(6));
        }
    };

    let totalRoutes = 0;
    let authRoutes = 0;

    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            const methods = Object.keys(middleware.route.methods).map((m) => m.toUpperCase());
            const hasAuth = middleware.route.stack.some((layer) => layer.name === 'authenticateToken');

            methods.forEach((method) => {
                console.log(
                    `${colorMethod(method)} ${middleware.route.path.padEnd(40)} ${hasAuth ? chalk.blueBright('🔒 Auth') : chalk.greenBright('🔓 Public')}`
                );
                totalRoutes++;
                if (hasAuth) authRoutes++;
            });
        } else if (middleware.name === 'router') {
            const base = cleanPath(middleware.regexp);
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const methods = Object.keys(handler.route.methods).map((m) => m.toUpperCase());
                    const hasAuth = handler.route.stack.some((layer) => layer.name === 'authenticateToken');

                    methods.forEach((method) => {
                        console.log(
                            `${colorMethod(method)} ${(base + handler.route.path).padEnd(40)} ${hasAuth ? chalk.blueBright('🔒 Auth') : chalk.greenBright('🔓 Public')}`
                        );
                        totalRoutes++;
                        if (hasAuth) authRoutes++;
                    });
                }
            });
        }
    });

    console.log(
        chalk.cyan.bold(
            `\n✅ Done listing routes. Total: ${chalk.yellow(totalRoutes)}, with Auth: ${chalk.red(authRoutes)}, Public: ${chalk.green(totalRoutes - authRoutes)}\n`
        )
    );
};

module.exports = listRoutes;
