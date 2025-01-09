const { RESOURCES, ACTIONS } = require("../../authorization.manager");

module.exports = class UserManager {
    constructor({ managers, validators, mongoModels } = {}) {
        this.userValidators = validators.user;
        this.userModel = mongoModels.user;
        this.schoolModel = mongoModels.school;
        this.tokenManager = managers.token;
        this.authorizationManager = managers.authorization;
        this.httpExposed = ['post=createUser', 'post=login'];
    }

    async createUser({ firstName, lastName, email, password, role, schoolId, __accessToken }) {
        console.log("󱓞 ~ UserManager ~ createUser ~ __accessToken:", __accessToken)
        const actionInitiatorRole = __accessToken.role;
        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.USER, ACTIONS.CREATE);
        if (!isAuthorized) {
            return { ok: false, code: 403, errors: 'unauthorized' };
        }
        const user = { firstName, lastName, email, password, role, schoolId };
        const validation = await this.userValidators.createUser(user);
        if (validation) return validation;

        if (role === 'schoolAdmin' && !schoolId) {
            return { ok: false, code: 400, errors: 'schoolId is required for schoolAdmin' };
        }
        if (role === 'schoolAdmin') {
            const school = await this.schoolModel.findOne({ _id: schoolId });
            if (!school) {
                return { ok: false, code: 400, errors: 'school not found' };
            }
        }

        const userExists = await this.userModel.findOne({ email });
        if (userExists) {
            return { ok: false, code: 400, errors: 'user already exists' };
        }

        const createdUser = await this.userModel.create(user);
        const { accessToken, refreshToken, expiresIn } = this.tokenManager.generateAuthTokens({ userId: createdUser._id, role: createdUser.role, schoolId: createdUser.schoolId });
        return { user: this._sanitizeUser(createdUser.toJSON()), accessToken, refreshToken, expiresIn };
    }

    async login({ email, password }) {
        const userInput = { email, password };
        const validation = await this.userValidators.login(userInput);
        if (validation) return validation;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            return { ok: false, code: 400, errors: 'user not found' };
        }

        const passwordMatch = await user.comparePassword(password, user.password);
        if (!passwordMatch) {
            return { ok: false, code: 400, errors: 'invalid password' };
        }

        const { accessToken, refreshToken, expiresIn } = await this.tokenManager.generateAuthTokens({ userId: user._id, role: user.role, schoolId: user.schoolId });
        return { accessToken, refreshToken, expiresIn };
    }

    // This method is used to seed the super admin user
    // This method is not exposed via HTTP
    async seedSuperAdmin() {
        try {
            const superAdmin = {
                firstName: 'super',
                lastName: 'admin',
                email: 'admin@schools.com',
                password: 'password',
                role: 'superAdmin',
                schoolId: null
            };
            const userExists = await this.userModel.findOne({ email: superAdmin.email });
            if (userExists) {
                return { ok: true, data: 'super admin already exists' };
            }
            const createdUser = await this.userModel.create(superAdmin);
            console.log('super admin seeded');
        } catch (error) {
            console.log('failed to seed super admin', error);
        }
    }

    _sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
}
