const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const studentSchema = new Schema({
    classroomId: {
        type: Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
