const { z } = require('zod');

const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

const positiveInt = z.coerce.number().int().positive();
const nullableId = z.union([positiveInt, z.null()]).optional();
const optionalText = z.string().trim().max(2000).optional().nullable();
const optionalShort = z.string().trim().max(32).optional().nullable();

const facultySchema = z.object({
  name: z.string().trim().min(2).max(255),
  shortName: optionalShort,
  description: optionalText,
});

const departmentSchema = z.object({
  facultyId: positiveInt,
  name: z.string().trim().min(2).max(255),
  shortName: optionalShort,
  headOfDepartmentId: nullableId,
  description: optionalText,
});

const specialtySchema = z.object({
  departmentId: positiveInt,
  code: z.string().trim().min(1).max(32),
  name: z.string().trim().min(2).max(255),
  degree: z.enum(['bachelor', 'master', 'phd']).default('bachelor'),
  durationYears: z.coerce.number().int().min(1).max(10).default(4),
  language: z.string().trim().max(8).optional().nullable(),
  description: optionalText,
});

const academicYearBase = z.object({
  startYear: z.coerce.number().int().min(2000).max(2100),
  endYear: z.coerce.number().int().min(2001).max(2101).optional(),
  isActive: z.coerce.boolean().optional().default(false),
});

const academicYearSchema = academicYearBase.transform((v) => ({
  ...v,
  endYear: v.endYear ?? v.startYear + 1,
}));

const semesterSchema = z.object({
  academicYearId: positiveInt,
  term: z.enum(['fall', 'spring', 'summer']),
  startDate: z.string().trim().optional().nullable(),
  endDate: z.string().trim().optional().nullable(),
  isActive: z.coerce.boolean().optional().default(false),
});

const groupSchema = z.object({
  specialtyId: positiveInt,
  name: z.string().trim().min(1).max(64),
  enrollmentYear: z.coerce.number().int().min(2000).max(2100),
  curatorId: nullableId,
  language: z.string().trim().max(8).optional().nullable(),
});

module.exports = {
  idParam,
  faculty: { body: facultySchema, params: idParam },
  facultyPartial: { body: facultySchema.partial(), params: idParam },
  department: { body: departmentSchema, params: idParam },
  departmentPartial: { body: departmentSchema.partial(), params: idParam },
  specialty: { body: specialtySchema, params: idParam },
  specialtyPartial: { body: specialtySchema.partial(), params: idParam },
  academicYear: { body: academicYearSchema, params: idParam },
  academicYearPartial: { body: academicYearBase.partial(), params: idParam },
  semester: { body: semesterSchema, params: idParam },
  semesterPartial: { body: semesterSchema.partial(), params: idParam },
  group: { body: groupSchema, params: idParam },
  groupPartial: { body: groupSchema.partial(), params: idParam },
};
