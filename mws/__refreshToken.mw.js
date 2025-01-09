module.exports = ({ meta, config, managers }) => {
    return async ({ req, res, next }) => {
        const token = req.headers.authorization
        if (!token) {
            console.log('token required but not found')
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
        }
        let decoded = null;
        try {
            decoded = await managers.token.verifyToken(token, 'refresh');
            if (!decoded) {
                console.log('failed to decode-1')
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
            };
        } catch (error) {
            console.log('failed to decode-2')
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
        }
        next(decoded);
    }
}