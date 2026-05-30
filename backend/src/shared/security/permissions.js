/**
 * RBAC: матрица разрешений по ролям.
 *
 * Каждое разрешение — это семантическое действие в домене.
 * Роли наследуют разрешения только явно (без implicit inheritance) — это упрощает
 * аудит и проверку доступа.
 */

const ROLES = Object.freeze({
  ADMIN: 'admin',
  DEAN: 'dean',
  HEAD_OF_DEPARTMENT: 'head_of_department',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
});

const PERMISSIONS = Object.freeze({
  USER_MANAGE: 'user.manage',
  USER_VIEW_ALL: 'user.view_all',

  STRUCTURE_MANAGE: 'structure.manage', // факультеты/кафедры/специальности/группы
  STRUCTURE_VIEW: 'structure.view',

  COURSE_CREATE: 'course.create',
  COURSE_UPDATE: 'course.update',
  COURSE_DELETE: 'course.delete',
  COURSE_VIEW_ALL: 'course.view_all',
  COURSE_VIEW_OWN: 'course.view_own',
  COURSE_MANAGE_MEMBERS: 'course.manage_members',

  ASSIGNMENT_CREATE: 'assignment.create',
  ASSIGNMENT_UPDATE: 'assignment.update',
  ASSIGNMENT_DELETE: 'assignment.delete',
  ASSIGNMENT_SUBMIT: 'assignment.submit',

  GRADE_ASSIGN: 'grade.assign',
  GRADE_VIEW_OWN: 'grade.view_own',
  GRADE_VIEW_ALL: 'grade.view_all',
  GRADE_FINALIZE: 'grade.finalize', // утвердить ведомость

  ATTENDANCE_MARK: 'attendance.mark',
  ATTENDANCE_VIEW_OWN: 'attendance.view_own',
  ATTENDANCE_VIEW_ALL: 'attendance.view_all',

  SCHEDULE_MANAGE: 'schedule.manage',
  SCHEDULE_VIEW: 'schedule.view',

  REPORT_VIEW_ALL: 'report.view_all',
  REPORT_VIEW_DEPARTMENT: 'report.view_department',

  AUDIT_VIEW: 'audit.view',
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: new Set(Object.values(PERMISSIONS)),

  [ROLES.DEAN]: new Set([
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.STRUCTURE_VIEW,
    PERMISSIONS.COURSE_VIEW_ALL,
    PERMISSIONS.GRADE_VIEW_ALL,
    PERMISSIONS.GRADE_FINALIZE,
    PERMISSIONS.ATTENDANCE_VIEW_ALL,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.REPORT_VIEW_ALL,
    PERMISSIONS.REPORT_VIEW_DEPARTMENT,
  ]),

  [ROLES.HEAD_OF_DEPARTMENT]: new Set([
    PERMISSIONS.USER_VIEW_ALL,
    PERMISSIONS.STRUCTURE_VIEW,
    PERMISSIONS.COURSE_VIEW_ALL,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.COURSE_MANAGE_MEMBERS,
    PERMISSIONS.GRADE_VIEW_ALL,
    PERMISSIONS.ATTENDANCE_VIEW_ALL,
    PERMISSIONS.SCHEDULE_MANAGE,
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.REPORT_VIEW_DEPARTMENT,
  ]),

  [ROLES.TEACHER]: new Set([
    PERMISSIONS.COURSE_VIEW_OWN,
    PERMISSIONS.ASSIGNMENT_CREATE,
    PERMISSIONS.ASSIGNMENT_UPDATE,
    PERMISSIONS.ASSIGNMENT_DELETE,
    PERMISSIONS.GRADE_ASSIGN,
    PERMISSIONS.GRADE_VIEW_ALL,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.ATTENDANCE_VIEW_ALL,
    PERMISSIONS.SCHEDULE_VIEW,
  ]),

  [ROLES.STUDENT]: new Set([
    PERMISSIONS.COURSE_VIEW_OWN,
    PERMISSIONS.ASSIGNMENT_SUBMIT,
    PERMISSIONS.GRADE_VIEW_OWN,
    PERMISSIONS.ATTENDANCE_VIEW_OWN,
    PERMISSIONS.SCHEDULE_VIEW,
  ]),

  [ROLES.PARENT]: new Set([
    PERMISSIONS.GRADE_VIEW_OWN,
    PERMISSIONS.ATTENDANCE_VIEW_OWN,
    PERMISSIONS.SCHEDULE_VIEW,
  ]),
});

function roleHasPermission(role, permission) {
  const set = ROLE_PERMISSIONS[role];
  return !!set && set.has(permission);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  roleHasPermission,
};
