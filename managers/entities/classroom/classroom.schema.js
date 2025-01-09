module.exports = {
    createClassroom: [
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
        { label: "name", path: "name", model: "text", required: true },
        { label: "capacity", path: "capacity", model: "number", required: true },
        { label: "academicYear", path: "academicYear", model: "text", required: true }
    ],
    getClassrooms: [
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    getClassroomById: [
        { label: "classroomId", path: "classroomId", model: "mongoId", required: true },
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    updateClassroom: [
        { label: "classroomId", path: "classroomId", model: "mongoId", required: true },
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
        { label: "name", path: "name", model: "text", required: false },
        { label: "capacity", path: "capacity", model: "number", required: false },
        { label: "academicYear", path: "academicYear", model: "text", required: false }
    ],
    deleteClassroom: [
        { label: "classroomId", path: "classroomId", model: "mongoId", required: true },
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    getStudents: [
        { label: "classroomId", path: "classroomId", model: "mongoId", required: true },
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    addStudentToClassroom: [
        { label: "classroomId", path: "classroomId", model: "mongoId", required: true },
        { label: "studentId", path: "studentId", model: "mongoId", required: true },
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    removeStudentFromClassroom: [
        { label: "classroomId", path: "classroomId", model: "mongoId", required: true },
        { label: "studentId", path: "studentId", model: "mongoId", required: true },
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
}


