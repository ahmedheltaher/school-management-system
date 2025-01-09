const { RESOURCES, ACTIONS } = require("../../authorization.manager");

module.exports = class SchoolManagers {

    constructor({ managers, validators, mongoModels } = {}) {
        this.schoolValidators = validators.school;
        this.schoolModel = mongoModels.school;
        this.userModel = mongoModels.user;
        this.tokenManager = managers.token;
        this.authorizationManager = managers.authorization;
        this.httpExposed = ['post=createSchool', 'get=getSchools', 'post=getSchoolById', 'put=updateSchool', 'delete=deleteSchool', 'post=getSchoolAdmins', 'post=getStudents'];
    }

    async createSchool({ name, address, contact, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.SCHOOL, ACTIONS.CREATE);
        if (!isAuthorized) {
            return { ok: false, code: 403, errors: 'unauthorized' };
        }
        const school = { name, address, contact };
        const validation = await this.schoolValidators.createSchool(school);
        if (validation) return validation;

        const schoolExists = await this.schoolModel.findOne({ name });
        if (schoolExists) {
            return { ok: false, code: 400, errors: 'school already exists' };
        }

        const createdSchool = await this.schoolModel.create(school);
        return { createdSchool };
    }

    async getSchools({ __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.SCHOOL, ACTIONS.LIST);
        if (!isAuthorized) {
            return { ok: false, code: 403, errors: 'unauthorized' };
        }
        const schools = await this.schoolModel.find();
        return { schools };
    }

    async getSchoolById({ schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.SCHOOL, ACTIONS.READ);
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.userModel.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.schoolValidators.getSchoolById({ schoolId });
        if (validation) return validation;

        const school = await this.schoolModel.findOne({ _id: schoolId });
        return { school };
    }

    async updateSchool({ schoolId, name, address, contact, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.SCHOOL, ACTIONS.UPDATE);
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.userModel.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' }); if (!user)
                return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const school = { name, address, contact };
        const validation = await this.schoolValidators.updateSchool(school);
        if (validation) return validation;

        const updatedSchool = await this.schoolModel.findOneAndUpdate({ _id: schoolId }, school, { new: true });
        return { updatedSchool };
    }

    async deleteSchool({ schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.SCHOOL, ACTIONS.DELETE);
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.userModel.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.schoolValidators.deleteSchool({ schoolId });
        if (validation) return validation;

        await this.schoolModel.findOneAndDelete({ _id: schoolId });
        return { ok: true };
    }

    async getSchoolAdmins({ schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.USER, ACTIONS.LIST);
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.userModel.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.schoolValidators.getSchoolAdmins({ schoolId });
        if (validation) return validation;

        const school = await this.schoolModel.findOne({ _id: schoolId });
        if (!school) return { ok: false, code: 400, errors: 'school not found' };


        const schoolAdmins = await this.userModel.find({ schoolId, role: 'schoolAdmin' });
        return { schoolAdmins };
    }

    async getStudents({ schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole }, RESOURCES.USER, ACTIONS.LIST);
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.userModel.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.schoolValidators.getStudents({ schoolId });
        if (validation) return validation;

        const school = await this.schoolModel.findOne({ _id: schoolId });
        if (!school) return { ok: false, code: 400, errors: 'school not found' };

        const students = await this.userModel.find({ schoolId, role: 'student' });
        return { students };
    }
}
