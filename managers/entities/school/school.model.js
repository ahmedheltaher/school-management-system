const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	address: {
		street: String,
		city: String,
		state: String,
		country: String,
		zipCode: String
	},
	contact: {
		phone: String,
		email: {
			type: String,
			lowercase: true
		}
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);
