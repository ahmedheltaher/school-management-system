
require('dotenv').config()
const os = require('os');
const pjson = require('../package.json');
const utils = require('../libs/utils');
const SERVICE_NAME = (process.env.SERVICE_NAME) ? utils.slugify(process.env.SERVICE_NAME) : pjson.name;
console.log("󱓞 ~ SERVICE_NAME:", SERVICE_NAME)
const USER_PORT = process.env.USER_PORT || 5111;
const ADMIN_PORT = process.env.ADMIN_PORT || 5222;
const ADMIN_URL = process.env.ADMIN_URL || `http://localhost:${ADMIN_PORT}`;
const ENV = process.env.ENV || "development";
const REDIS_URI = process.env.REDIS_URI || "redis://127.0.0.1:6379";

const CORTEX_REDIS = process.env.CORTEX_REDIS || REDIS_URI;
const CORTEX_PREFIX = process.env.CORTEX_PREFIX || 'none';
const CORTEX_TYPE = process.env.CORTEX_TYPE || SERVICE_NAME;
const OYSTER_REDIS = process.env.OYSTER_REDIS || REDIS_URI;
const OYSTER_PREFIX = process.env.OYSTER_PREFIX || 'none';

const CACHE_REDIS = process.env.CACHE_REDIS || REDIS_URI;
const CACHE_PREFIX = process.env.CACHE_PREFIX || `${SERVICE_NAME}:ch`;

const MONGO_URI = process.env.MONGO_URI || `localhost:27017/${SERVICE_NAME}`;
const MONGO_USERNAME = process.env.MONGO_USERNAME || null;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || null;

const config = {} //require(`./envs/${ENV}.js`);

const accessTokenSecret = process.env.LONG_TOKEN_SECRET || null;
const refreshTokenSecret = process.env.SHORT_TOKEN_SECRET || null;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';

const NACL_SECRET = process.env.NACL_SECRET || null;

if (!accessTokenSecret || !refreshTokenSecret) {
    throw Error('missing .env variables check index.config');
}

config.dotEnv = {
    SERVICE_NAME,
    ENV,
    CORTEX_REDIS,
    CORTEX_PREFIX,
    CORTEX_TYPE,
    OYSTER_REDIS,
    OYSTER_PREFIX,
    CACHE_REDIS,
    CACHE_PREFIX,
    MONGO_URI,
    MONGO_USERNAME,
    MONGO_PASSWORD,
    USER_PORT,
    ADMIN_PORT,
    ADMIN_URL,
};

config.jwt = {
    accessTokenSecret,
    refreshTokenSecret,
    accessTokenExpiry,
    refreshTokenExpiry,
};



module.exports = config;
