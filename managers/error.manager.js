const ErrorCodes = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 403,
	NOT_FOUND: 404,
	CONFLICT: 409
};

const ErrorTypes = {
	UNAUTHORIZED: 'unauthorized',
	WRONG_CREDENTIALS: 'wrong credentials',
	INVALID_TOKEN: 'invalid token',
	USER_NOT_FOUND: 'user not found',
	SCHOOL_NOT_FOUND: 'school not found',
	CLASSROOM_NOT_FOUND: 'classroom not found',
	STUDENT_NOT_FOUND: 'student not found',
	USER_EXISTS: 'user already exists',
	SCHOOL_EXISTS: 'school already exists',
	CLASSROOM_EXISTS: 'classroom already exists',
	INVALID_INPUT: 'invalid input',
	INVALID_PASSWORD: 'invalid password',
	SCHOOL_ID_REQUIRED: 'schoolId is required'
};

class ErrorManager {
	static error(code, message) {
		return { ok: false, code, errors: message };
	}

	static unauthorized() {
		return this.error(ErrorCodes.UNAUTHORIZED, ErrorTypes.UNAUTHORIZED);
	}

	static invalidToken() {
		return this.error(ErrorCodes.UNAUTHORIZED, ErrorTypes.INVALID_TOKEN);
	}

	static notFound(type) {
		return this.error(ErrorCodes.NOT_FOUND, type);
	}

	static conflict(type) {
		return this.error(ErrorCodes.CONFLICT, type);
	}

	static invalidInput(details = ErrorTypes.INVALID_INPUT) {
		return this.error(ErrorCodes.BAD_REQUEST, details);
	}

	static wrongCredentials() {
		return this.error(ErrorCodes.UNAUTHORIZED, ErrorTypes.WRONG_CREDENTIALS);
	}
}

module.exports = {
	ErrorManager,
	ErrorCodes,
	ErrorTypes
};
