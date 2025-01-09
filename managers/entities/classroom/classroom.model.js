const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
	schoolId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'School',
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	capacity: {
		type: Number,
		required: true
	},
	academicYear: {
		type: String,
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);
