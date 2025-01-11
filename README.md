# School Management API  

This repository provides the School Management API, designed using the [Axion boilerplate](https://github.com/qantra-io/axion). The API facilitates managing Schools, Classrooms, and Students, with role-specific permissions for Superadmins, School Admins, and Students.  

---

## Key Features  

### **Entity Management**  

- **Schools**: Create, Read, Update, and Delete school records.  
- **Classrooms**: Manage classrooms linked to schools.  
- **Students**: Handle student information in classrooms.  

### **Role-Specific Permissions**  

- **Superadmins**: Full access to all data and user management.  
- **School Admins**: Limited to classrooms and students within their school.  
- **Students**: Restricted to viewing their school, classroom, and personal data.  

#### **Permissions Example**  

Permissions are assigned based on user roles, as shown below:  

```javascript  
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
```  

### **Secure Authentication & Authorization**  

- **JWT-based authentication** ensures stateless security.  
- Fine-grained control over actions per role.  

---

## Deployment Details  

- **Live Server**: [Access the API](https://school-management-system-production-23a8.up.railway.app/)  
- **Postman Collection**: [Download Here](./school-management-system.postman_collection.json)  

---

## Additional Information  

- Test using the **Super Admin credentials**:  
  - **Username**: `admin@schools.com`  
  - **Password**: `password`  

## Database Schema

```Mermaid
erDiagram
    User {
        ObjectId _id
        String email
        String password
        String role
        String firstName
        String lastName
        ObjectId schoolId
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    School {
        ObjectId _id
        String name
        Object address
        Object contact
        DateTime createdAt
        DateTime updatedAt
    }

    Student {
        ObjectId _id
        ObjectId classroomId
        ObjectId userId
        ObjectId schoolId
        DateTime createdAt
        DateTime updatedAt
    }

    Classroom {
        ObjectId _id
        ObjectId schoolId
        String name
        Number capacity
        String academicYear
        DateTime createdAt
        DateTime updatedAt
    }

    School ||--o{ User : "has"
    School ||--o{ Student : "has"
    School ||--o{ Classroom : "has"
    User ||--o| Student : "can_be"
    Classroom ||--o{ Student : "contains"
```
