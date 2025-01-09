const RESOURCES = {
	SCHOOL: 'school',
	CLASSROOM: 'classroom',
	STUDENT: 'student',
	USER: 'user'
};

const ACTIONS = {
	CREATE: 'create',
	READ: 'read',
	UPDATE: 'update',
	DELETE: 'delete',
	LIST: 'list',
	MANAGE: 'manage'
};

const ROLE_PERMISSIONS = {
	superAdmin: {
		[RESOURCES.SCHOOL]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.MANAGE],
		[RESOURCES.USER]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.MANAGE],
		[RESOURCES.CLASSROOM]: [ACTIONS.READ, ACTIONS.LIST],
		[RESOURCES.STUDENT]: [ACTIONS.READ, ACTIONS.LIST]
	},
	schoolAdmin: {
		[RESOURCES.SCHOOL]: [ACTIONS.READ],
		[RESOURCES.CLASSROOM]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.MANAGE],
		[RESOURCES.STUDENT]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.LIST, ACTIONS.MANAGE],
	},
	student: {
		[RESOURCES.SCHOOL]: [ACTIONS.READ],
		[RESOURCES.CLASSROOM]: [ACTIONS.READ],
		[RESOURCES.STUDENT]: [ACTIONS.READ, ACTIONS.UPDATE], // Can only read/update their own profile
	}
};

class AuthorizationManager {
	/**
	 * Check if user has permission to perform action on resource
	 * @param {Object} user - User object from request
	 * @param {string} resource - Resource type
	 * @param {string} action - Action to perform
	 * @param {Object} context - Additional context (e.g., schoolId, studentId)
	 * @returns {boolean}
	 */
	hasPermission(user, resource, action, context = {}) {
		if (!user || !user.role) {
			return false;
		}

		const rolePermissions = ROLE_PERMISSIONS[user.role];
		if (!rolePermissions) {
			return false;
		}

		const resourcePermissions = rolePermissions[resource];
		if (!resourcePermissions) {
			return false;
		}

		// Check if user has permission for the action
		const hasActionPermission = resourcePermissions.includes(action);
		if (!hasActionPermission) {
			return false;
		}

		// Role-specific context checks
		switch (user.role) {
			case 'schoolAdmin':
				return user.schoolId.toString() === context.schoolId.toString();

			case 'student':
				// Students can only access their own resources
				if (context.studentId) {
					return user.studentId.toString() === context.studentId.toString();
				}
				// For classroom/school-wide resources, check if student belongs to the school/classroom
				return user.schoolId.toString() === context.schoolId.toString() &&
					(!context.classroomId || user.classroomId.toString() === context.classroomId.toString());

			default:
				return true;
		}
	}
}

module.exports = {
	AuthorizationManager,
	RESOURCES,
	ACTIONS
};