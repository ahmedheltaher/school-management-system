const jwt = require('jsonwebtoken');

module.exports = class TokenManager {
    constructor({ config }) {
        this.accessTokenSecret = config.jwt.accessTokenSecret;
        this.refreshTokenSecret = config.jwt.refreshTokenSecret;
        this.accessTokenExpiry = config.jwt.accessTokenExpiry;
        this.refreshTokenExpiry = config.jwt.refreshTokenExpiry;

        this.httpExposed = ['get=refreshAccessToken']
    }


    async refreshAccessToken({ __headers }) {
        const accessToken = await this._refreshAccessToken(__headers.authorization);
        return { accessToken };
    }

    /**
     * Generate access and refresh tokens
     * @param {Object} payload - Data to encode in the token
     * @returns {Object} Object containing both tokens
     */
    async generateAuthTokens(payload) {
        try {
            const sanitizedPayload = this._sanitizePayload(payload);
            const accessToken = await this.createAccessToken(sanitizedPayload);
            const refreshToken = await this.createRefreshToken(sanitizedPayload);

            return {
                accessToken,
                refreshToken,
                expiresIn: this._getExpiryTime(this.accessTokenExpiry)
            };
        } catch (error) {
            throw new Error(`Error generating auth tokens: ${error.message}`);
        }
    }

    /**
     * Create an access token
     * @param {Object} payload - Data to encode in the token
     * @returns {String} Access token
     */
    async createAccessToken(payload) {
        try {
            return jwt.sign(payload, this.accessTokenSecret, {
                expiresIn: this.accessTokenExpiry
            });
        } catch (error) {
            throw new Error(`Error creating access token: ${error.message}`);
        }
    }

    /**
     * Create a refresh token
     * @param {Object} payload - Data to encode in the token
     * @returns {String} Refresh token
     */
    async createRefreshToken(payload) {
        try {
            return jwt.sign(payload, this.refreshTokenSecret, {
                expiresIn: this.refreshTokenExpiry
            });
        } catch (error) {
            throw new Error(`Error creating refresh token: ${error.message}`);
        }
    }

    /**
     * Verify and decode a token
     * @param {String} token - Token to decode
     * @param {String} type - Token type ('access' or 'refresh')
     * @returns {Object} Decoded token payload
     */
    async verifyToken(token, type = 'access') {
        try {
            const secret = type === 'refresh' ? this.refreshTokenSecret : this.accessTokenSecret;
            return jwt.verify(token, secret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            }
            throw new Error(`Invalid token: ${error.message}`);
        }
    }

    /**
     * Decode a token without verification
     * @param {String} token - Token to decode
     * @returns {Object} Decoded token payload
     */
    decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new Error(`Error decoding token: ${error.message}`);
        }
    }

    /**
     * Refresh an access token using a refresh token
     * @param {String} refreshToken - Valid refresh token
     * @returns {Object} New access token and its expiry
     */
    async _refreshAccessToken(refreshToken) {
        try {
            const decoded = await this.verifyToken(refreshToken, 'refresh');
            const accessToken = await this.createAccessToken(this._sanitizePayload(decoded));

            return {
                accessToken,
                expiresIn: this._getExpiryTime(this.accessTokenExpiry)
            };
        } catch (error) {
            throw new Error(`Error refreshing access token: ${error.message}`);
        }
    }

    /**
     * Sanitize payload by removing sensitive data
     * @param {Object} payload - Payload to sanitize
     * @returns {Object} Sanitized payload
     * @private
     */
    _sanitizePayload(payload) {
        const { password, exp, ita, ...sanitizedPayload } = payload;
        return sanitizedPayload;
    }

    /**
     * Convert expiry time string to timestamp
     * @param {String} expiry - Expiry time string
     * @returns {Number} Expiry timestamp
     * @private
     */
    _getExpiryTime(expiry) {
        const units = { s: 1, m: 60, h: 3600, d: 86_400 };
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) return 60 * 60 * 1000; // Default to 1 hour
        const [, time, unit] = match;
        return parseInt(time) * units[unit] * 1000; // Convert to milliseconds
    }
}