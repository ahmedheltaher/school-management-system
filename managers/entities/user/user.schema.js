module.exports = {
    createUser: [
        { label: "firstName", path: "firstName", model: "text", required: true },
        { label: "lastName", path: "lastName", model: "text", required: true },
        { label: "email", path: "email", model: 'email', required: true, },
        { label: "password", path: "password", model: 'password', required: true },
        { label: "role", path: "role", model: 'role', required: true },
        { label: "schoolId", path: "schoolId", model: 'mongoId', required: false }
    ],
    login: [
        { label: "email", path: "email", model: 'email', required: true },
        { label: "password", path: "password", model: 'password', required: true }
    ],
};