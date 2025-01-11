const { ErrorTypes, ErrorManager } = require('../../error.manager');
const { RESOURCES, ACTIONS, ROLES } = require('../../authorization.manager');

module.exports = class SchoolManagers {
    constructor({ managers, validators, mongoModels } = {}) {
        this.schoolValidators = validators.school;
        this.schoolModel = mongoModels.school;
        this.userModel = mongoModels.user;
        this.tokenManager = managers.token;
        this.authorizationManager = managers.authorization;
        this.httpExposed = [
            'post=createSchool',
            'get=getSchools',
            'post=getSchoolById',
            'put=updateSchool',
            'delete=deleteSchool',
            'post=getSchoolAdmins',
            'post=getStudents',
        ];
    }

    async createSchool({ name, address, contact, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.SCHOOL, ACTIONS.CREATE)) {
            return this._unauthorized();
        }

        const school = { name, address, contact };
        const validationError = await this.schoolValidators.createSchool(school);
        if (validationError) return validationError;

        if (await this.schoolModel.findOne({ name })) {
            return ErrorManager.conflict(ErrorTypes.SCHOOL_EXISTS);
        }

        const createdSchool = await this.schoolModel.create(school);
        return { school: createdSchool };
    }

    async getSchools({ __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.SCHOOL, ACTIONS.LIST)) {
            return this._unauthorized();
        }

        const schools = await this.schoolModel.find();
        return { schools };
    }

    async getSchoolById({ schoolId, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.SCHOOL, ACTIONS.READ)) {
            return this._unauthorized();
        }

        if (!(await this._isAuthorizedForSchool(__accessToken, schoolId))) {
            return this._unauthorized();
        }

        const validationError = await this.schoolValidators.getSchoolById({ schoolId });
        if (validationError) return validationError;

        const school = await this.schoolModel.findOne({ _id: schoolId });
        if (!school) return ErrorManager.notFound(ErrorTypes.SCHOOL_NOT_FOUND);

        return { school };
    }

    async updateSchool({ schoolId, name, address, contact, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.SCHOOL, ACTIONS.UPDATE)) {
            return this._unauthorized();
        }

        if (!(await this._isAuthorizedForSchool(__accessToken, schoolId))) {
            return this._unauthorized();
        }

        const school = { name, address, contact };
        const validationError = await this.schoolValidators.updateSchool(school);
        if (validationError) return validationError;

        const updatedSchool = await this.schoolModel.findOneAndUpdate(
            { _id: schoolId },
            school,
            { new: true }
        );
        if (!updatedSchool) return ErrorManager.notFound(ErrorTypes.SCHOOL_NOT_FOUND);

        return { school: updatedSchool };
    }

    async deleteSchool({ schoolId, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.SCHOOL, ACTIONS.DELETE)) {
            return this._unauthorized();
        }

        if (!(await this._isAuthorizedForSchool(__accessToken, schoolId))) {
            return this._unauthorized();
        }

        const validationError = await this.schoolValidators.deleteSchool({ schoolId });
        if (validationError) return validationError;

        const deletedSchool = await this.schoolModel.findOneAndDelete({ _id: schoolId });
        if (!deletedSchool) return ErrorManager.notFound(ErrorTypes.SCHOOL_NOT_FOUND);

        return { ok: true };
    }

    async getSchoolAdmins({ schoolId, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.USER, ACTIONS.LIST)) {
            return this._unauthorized();
        }

        if (!(await this._isAuthorizedForSchool(__accessToken, schoolId))) {
            return this._unauthorized();
        }

        const validationError = await this.schoolValidators.getSchoolAdmins({ schoolId });
        if (validationError) return validationError;

        const schoolAdmins = await this.userModel.find({ schoolId, role: ROLES.SCHOOL_ADMIN });
        return { schoolAdmins };
    }

    async getStudents({ schoolId, __accessToken }) {
        if (!this._hasPermission(__accessToken.role, RESOURCES.USER, ACTIONS.LIST)) {
            return this._unauthorized();
        }

        if (!(await this._isAuthorizedForSchool(__accessToken, schoolId))) {
            return this._unauthorized();
        }

        const validationError = await this.schoolValidators.getStudents({ schoolId });
        if (validationError) return validationError;

        const students = await this.userModel.find({ schoolId, role: ROLES.STUDENT });
        return { students };
    }

    _hasPermission(role, resource, action) {
        return this.authorizationManager.hasPermission({ role }, resource, action);
    }

    _unauthorized() {
        return ErrorManager.unauthorized();
    }

    async _isAuthorizedForSchool({ role, userId }, schoolId) {
        if (role === ROLES.SUPER_ADMIN) return true;

        const user = await this.userModel.findOne({ _id: userId, schoolId, role: ROLES.SCHOOL_ADMIN });
        return !!user;
    }
};