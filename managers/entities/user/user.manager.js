const { ErrorTypes, ErrorManager } = require('../../error.manager');
const { RESOURCES, ACTIONS, ROLES } = require('../../authorization.manager');

class UserManager {
    constructor({ managers, validators, mongoModels } = {}) {
        this.userValidators = validators.user;
        this.userModel = mongoModels.user;
        this.schoolModel = mongoModels.school;
        this.tokenManager = managers.token;
        this.authorizationManager = managers.authorization;
        this.httpExposed = ['post=createUser', 'post=login'];
    }

    async createUser({ firstName, lastName, email, password, role, schoolId, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.USER, ACTIONS.CREATE)) {
            return this._unauthorized();
        }

        const user = { firstName, lastName, email, password, role, schoolId };
        const validationError = await this.userValidators.createUser(user);
        if (validationError) return validationError;

        if (role === ROLES.SCHOOL_ADMIN) {
            const schoolValidationError = await this._validateSchool(schoolId);
            if (schoolValidationError) return schoolValidationError;
        }

        if (await this.userModel.findOne({ email })) {
            return ErrorManager.conflict(ErrorTypes.USER_EXISTS);
        }

        const createdUser = await this.userModel.create(user);
        const tokens = this.tokenManager.generateAuthTokens({
            userId: createdUser._id,
            role: createdUser.role,
            schoolId: createdUser.schoolId
        });

        return { user: this._sanitizeUser(createdUser.toJSON()), ...tokens };
    }

    async login({ email, password }) {
        const validationError = await this.userValidators.login({ email, password });
        if (validationError) return validationError;

        const user = await this.userModel.findOne({ email });
        if (!user || !(await user.comparePassword(password, user.password))) {
            return ErrorManager.wrongCredentials();
        }

        return this.tokenManager.generateAuthTokens({
            userId: user._id,
            role: user.role,
            schoolId: user.schoolId
        });
    }

    async seedSuperAdmin() {
        const superAdmin = {
            firstName: 'super',
            lastName: 'admin',
            email: 'admin@schools.com',
            password: 'password',
            role: ROLES.SUPER_ADMIN,
            schoolId: null
        };

        if (await this.userModel.findOne({ email: superAdmin.email })) {
            console.log('Super admin already seeded');
            return;
        }

        try {
            await this.userModel.create(superAdmin);
            console.log('Super admin seeded');
        } catch (error) {
            console.error('Failed to seed super admin:', error);
        }
    }

    _sanitizeUser(user) {
        const { password, _id, __v, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    _hasPermission(role, resource, action) {
        return this.authorizationManager.hasPermission({ role }, resource, action);
    }

    _unauthorized() {
        return ErrorManager.unauthorized();
    }

    async _validateSchool(schoolId) {
        if (!schoolId) return ErrorManager.invalidInput(ErrorTypes.SCHOOL_ID_REQUIRED);
        const school = await this.schoolModel.findOne({ _id: schoolId });
        if (!school) return ErrorManager.notFound(ErrorTypes.SCHOOL_NOT_FOUND);
        return null;
    }

}

module.exports = UserManager;
