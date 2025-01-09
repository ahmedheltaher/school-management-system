const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['superAdmin', 'schoolAdmin', 'student'],
		required: true
	},
	firstName: {
		type: String,
		required: true,
		trim: true
	},
	lastName: {
		type: String,
		required: true,
		trim: true
	},
	schoolId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'School',
		required: function () {
			return this.role !== 'superAdmin';
		}
	},
	status: {
		type: String,
		enum: ['active', 'inactive'],
		default: 'active'
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
	if (this.isModified('password') || this.isNew) {
		try {
			const salt = await bcrypt.genSalt(10);
			this.password = await bcrypt.hash(this.password, salt);
			next();
		} catch (err) {
			next(err);
		}
	} else {
		return next();
	}
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = mongoose.model('User', userSchema);