const { ErrorTypes, ErrorManager } = require('../../error.manager');
const { RESOURCES, ACTIONS, ROLES } = require('../../authorization.manager');

module.exports = class ClassroomManagers {

    constructor({ managers, validators, mongoModels } = {}) {
        this.classroomValidators = validators.classroom;
        this.mongoModels = mongoModels;
        this.tokenManager = managers.token;
        this.authorizationManager = managers.authorization;
        this.httpExposed = [
            "post=createClassroom",
            "get=getClassrooms",
            "post=getClassroomById",
            "put=updateClassroom",
            "delete=deleteClassroom",
            "post=getStudents",
            "post=addStudentToClassroom",
            "delete=removeStudentFromClassroom"
        ];
    }

    async authorizeAction(__accessToken, resource, action, { schoolId }) {
        const { role, userId, schoolId: actionInitiatorSchoolId } = __accessToken;

        const isAuthorized = this.authorizationManager.hasPermission(
            { role, schoolId: actionInitiatorSchoolId },
            resource,
            action,
            { schoolId }
        );
        if (!isAuthorized) {
            return ErrorManager.unauthorized();
        }

        if (role !== ROLES.SUPER_ADMIN) {
            const user = await this.mongoModels.user.findOne({ _id: userId, schoolId, role: ROLES.SCHOOL_ADMIN });
            if (!user) {
                return ErrorManager.unauthorized();
            }
        }

        return { ok: true };
    }

    async createClassroom({ name, capacity, academicYear, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.CLASSROOM, ACTIONS.CREATE, { schoolId });
        if (!authorization.ok) return authorization;

        const classroom = { name, capacity, academicYear, schoolId };
        const validation = await this.classroomValidators.createClassroom(classroom);
        if (validation) return validation;

        const classroomExists = await this.mongoModels.classroom.findOne({ name });
        if (classroomExists) {
            return ErrorManager.conflict(ErrorTypes.CLASSROOM_EXISTS);
        }

        const createdClassroom = await this.mongoModels.classroom.create(classroom);
        return { createdClassroom };
    }

    async getClassrooms({ schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.CLASSROOM, ACTIONS.LIST, { schoolId });
        if (!authorization.ok) return authorization;

        const validation = await this.classroomValidators.getClassrooms({ schoolId });
        if (validation) return validation;

        const classrooms = await this.mongoModels.classroom.find({ schoolId });
        return { classrooms };
    }

    async getClassroomById({ classroomId, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.CLASSROOM, ACTIONS.READ, { schoolId });
        if (!authorization.ok) return authorization;

        const validation = await this.classroomValidators.getClassroomById({ classroomId, schoolId });
        if (validation) return validation;

        const classroom = await this.mongoModels.classroom.findOne({ _id: classroomId, schoolId });
        return { classroom };
    }

    async updateClassroom({ classroomId, name, capacity, academicYear, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.CLASSROOM, ACTIONS.UPDATE, { schoolId });
        if (!authorization.ok) return authorization;

        const classroom = { name, capacity, academicYear, schoolId };
        const validation = await this.classroomValidators.updateClassroom({ ...classroom, classroomId });
        if (validation) return validation;

        const updatedClassroom = await this.mongoModels.classroom.findOneAndUpdate(
            { _id: classroomId },
            classroom,
            { new: true }
        );
        return { updatedClassroom };
    }

    async deleteClassroom({ classroomId, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.CLASSROOM, ACTIONS.DELETE, { schoolId });
        if (!authorization.ok) return authorization;

        const validation = await this.classroomValidators.deleteClassroom({ classroomId, schoolId });
        if (validation) return validation;

        const deletedClassroom = await this.mongoModels.classroom.findOneAndDelete({ _id: classroomId });
        return { deletedClassroom };
    }

    async getStudents({ classroomId, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.STUDENT, ACTIONS.LIST, { schoolId });
        if (!authorization.ok) return authorization;

        const validation = await this.classroomValidators.getStudents({ classroomId, schoolId });
        if (validation) return validation;

        const students = await this.mongoModels.student.find({ classroomId });
        return { students };
    }

    async addStudentToClassroom({ studentId, classroomId, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.STUDENT, ACTIONS.UPDATE, { schoolId });
        if (!authorization.ok) return authorization;

        const validation = await this.classroomValidators.addStudentToClassroom({ studentId, classroomId, schoolId });
        if (validation) return validation;

        const student = await this.mongoModels.student.findOne({ _id: studentId });
        if (!student) return ErrorManager.notFound(ErrorTypes.STUDENT_NOT_FOUND);

        const classroom = await this.mongoModels.classroom.findOne({ _id: classroomId });
        if (!classroom) return ErrorManager.notFound(ErrorTypes.CLASSROOM_NOT_FOUND);

        const updatedStudent = await this.mongoModels.student.findOneAndUpdate(
            { _id: studentId },
            { classroomId },
            { new: true }
        );
        return { updatedStudent };
    }

    async removeStudentFromClassroom({ studentId, classroomId, schoolId, __accessToken }) {
        const authorization = await this.authorizeAction(__accessToken, RESOURCES.STUDENT, ACTIONS.UPDATE, { schoolId });
        if (!authorization.ok) return authorization;

        const validation = await this.classroomValidators.removeStudentFromClassroom({ studentId, classroomId, schoolId });
        if (validation) return validation;

        const student = await this.mongoModels.student.findOne({ _id: studentId });
        if (!student) return ErrorManager.notFound(ErrorTypes.STUDENT_NOT_FOUND);

        const classroom = await this.mongoModels.classroom.findOne({ _id: classroomId });
        if (!classroom) return ErrorManager.notFound(ErrorTypes.CLASSROOM_NOT_FOUND);

        const updatedStudent = await this.mongoModels.student.findOneAndUpdate(
            { _id: studentId },
            { classroomId: null },
            { new: true }
        );
        return { updatedStudent };
    }
};
