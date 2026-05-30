/**
 * Контракт репозитория оценивания. Описывает методы, нужные use-cases,
 * без привязки к ORM.
 *
 * @typedef {Object} GradingRepository
 * @property {(courseId:number) => Promise<Array<Object>>} findCategoriesByCourse
 * @property {(payload:Object) => Promise<Object>} createCategory
 * @property {(id:number, patch:Object) => Promise<Object>} updateCategory
 * @property {(id:number) => Promise<void>} deleteCategory
 *
 * @property {(courseId:number) => Promise<Array<Object>>} findCourseStudents
 * @property {(courseId:number) => Promise<Array<Object>>} findCourseAssignments
 * @property {(courseId:number) => Promise<Array<Object>>} findCourseGrades
 *
 * @property {(input:Object) => Promise<Object>} upsertFinalGrade
 * @property {(courseId:number) => Promise<Array<Object>>} findFinalGradesByCourse
 * @property {(studentId:number) => Promise<Array<Object>>} findFinalGradesByStudent
 *
 * @property {(courseId:number) => Promise<Object|null>} getCourse
 */
module.exports = {};
