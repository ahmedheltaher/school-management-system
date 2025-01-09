const { RESOURCES, ACTIONS } = require("../../authorization.manager");

module.exports = class ClassroomManagers {

    constructor({ managers, validators, mongoModels } = {}) {
        this.classroomValidators = validators.classroom;
        this.mongoModels = mongoModels;
        this.tokenManager = managers.token;
        this.authorizationManager = managers.authorization;
        this.httpExposed = ["post=createClassroom", "get=getClassrooms", "post=getClassroomById", "put=updateClassroom", "delete=deleteClassroom", "post=getStudents", "post=addStudentToClassroom", "delete=removeStudentFromClassroom"];
    }

    async createClassroom({ name, capacity, academicYear, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;
        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.CLASSROOM, ACTIONS.CREATE, { schoolId });
        if (!isAuthorized) {
            return { ok: false, code: 403, errors: 'unauthorized' };
        }

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const classroom = { name, capacity, academicYear, schoolId };
        const validation = await this.classroomValidators.createClassroom(classroom);
        if (validation) return validation;

        const classroomExists = await this.mongoModels.classroom.findOne({ name });
        if (classroomExists) {
            return { ok: false, code: 400, errors: 'classroom already exists' };
        }

        const createdClassroom = await this.mongoModels.classroom.create(classroom);
        return { createdClassroom };
    }

    async getClassrooms({ schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.CLASSROOM, ACTIONS.LIST, { schoolId });
        if (!isAuthorized) {
            return { ok: false, code: 403, errors: 'unauthorized' };
        }

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.classroomValidators.getClassrooms({ schoolId });
        if (validation) return validation;

        const classrooms = await this.mongoModels.classroom.find({ schoolId });
        return { classrooms };
    }

    async getClassroomById({ classroomId, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.CLASSROOM, ACTIONS.READ, { schoolId });
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.classroomValidators.getClassroomById({ classroomId, schoolId });
        if (validation) return validation;

        const classroom = await this.mongoModels.classroom.findOne({ _id: classroomId, schoolId });
        return { classroom };
    }

    async updateClassroom({ classroomId, name, capacity, academicYear, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.CLASSROOM, ACTIONS.UPDATE, { schoolId });
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const classroom = { name, capacity, academicYear, schoolId };
        const validation = await this.classroomValidators.updateClassroom({ ...classroom, classroomId });
        if (validation) return validation;

        const updatedClassroom = await this.mongoModels.classroom.findOneAndUpdate({ _id: classroomId }, classroom, { new: true });
        return { updatedClassroom };
    }

    async deleteClassroom({ classroomId, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.CLASSROOM, ACTIONS.DELETE, { schoolId });
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.classroomValidators.deleteClassroom({ classroomId, schoolId });
        if (validation) return validation;

        const deletedClassroom = await this.mongoModels.classroom.findOneAndDelete({ _id: classroomId });
        return { deletedClassroom };
    }

    async getStudents({ classroomId, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.STUDENT, ACTIONS.LIST, { schoolId });
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.classroomValidators.getStudents({ classroomId, schoolId });
        if (validation) return validation;

        const students = await this.mongoModels.student.find({ classroomId });
        return { students };
    }

    async addStudentToClassroom({ studentId, classroomId, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.STUDENT, ACTIONS.UPDATE, { schoolId });
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.classroomValidators.addStudentToClassroom({ studentId, classroomId, schoolId });
        if (validation) return validation;

        const student = await this.mongoModels.student.findOne({ _id: studentId });
        if (!student) return { ok: false, code: 400, errors: 'student not found' };

        const classroom = await this.mongoModels.classroom.findOne({ _id: classroomId });
        if (!classroom) return { ok: false, code: 400, errors: 'classroom not found' };

        const updatedStudent = await this.mongoModels.student.findOneAndUpdate({ _id: studentId }, { classroomId }, { new: true });
        return { updatedStudent };
    }

    async removeStudentFromClassroom({ studentId, classroomId, schoolId, __accessToken }) {
        const actionInitiatorRole = __accessToken.role;
        const actionInitiatorId = __accessToken.userId;
        const actionInitiatorShoolId = __accessToken.schoolId;

        const isAuthorized = this.authorizationManager.hasPermission({ role: actionInitiatorRole, schoolId: actionInitiatorShoolId }, RESOURCES.STUDENT, ACTIONS.UPDATE, { schoolId });
        if (!isAuthorized) return { ok: false, code: 403, errors: 'unauthorized' };

        if (actionInitiatorRole !== 'superAdmin') {
            const user = await this.mongoModels.user.findOne({ _id: actionInitiatorId, schoolId, role: 'schoolAdmin' });
            if (!user) return { ok: false, code: 403, errors: 'unauthorized' };
        }

        const validation = await this.classroomValidators.removeStudentFromClassroom({ studentId, classroomId, schoolId });
        if (validation) return validation;

        const student = await this.mongoModels.student.findOne({ _id: studentId });
        if (!student) return { ok: false, code: 400, errors: 'student not found' };

        const classroom = await this.mongoModels.classroom.findOne({ _id: classroomId });
        if (!classroom) return { ok: false, code: 400, errors: 'classroom not found' };

        const updatedStudent = await this.mongoModels.student.findOneAndUpdate({ _id: studentId }, { classroomId: null }, { new: true });
        return { updatedStudent };
    }
}
