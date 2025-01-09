const config = require('./config/index.config.js');
const ManagersLoader = require('./loaders/ManagersLoader.js');
const connectDB = require('./connect/mongo');

const MongoDB = connectDB({
    uri: config.dotEnv.MONGO_URI
});

process.on('uncaughtException', err => {
    console.log(`Uncaught Exception:`)
    console.log(err, err.stack);

    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason:`, reason);
    process.exit(1)
})

const cache = require('./cache/cache.dbh')({
    prefix: config.dotEnv.CACHE_PREFIX,
    url: config.dotEnv.CACHE_REDIS
});

const noOpHandler = {
    get: (target, prop) => {
        if (typeof prop === 'string') return () => { };
        return target[prop];
    },
};
const cortex = new Proxy({}, noOpHandler);

const managersLoader = new ManagersLoader({ config, cache, cortex, MongoDB });
const managers = managersLoader.load();

managers.userServer.run();
