module.exports = {
    createSchool: [
        { label: "name", path: "name", model: "text", required: true },
        { label: "address", path: "address", model: "address", required: true },
        { label: "contact", path: "contact", model: "contact", required: true }
    ],
    getSchoolById: [
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    updateSchool: [
        { label: "name", path: "name", model: "text", required: false },
        { label: "address", path: "address", model: "address", required: false },
        { label: "contact", path: "contact", model: "contact", required: false }
    ],
    getSchoolAdmins: [
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    deleteSchool: [
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
    getStudents: [
        { label: "schoolId", path: "schoolId", model: "mongoId", required: true },
    ],
}


