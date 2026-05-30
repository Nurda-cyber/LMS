const { z } = require('zod');

const courseIdParam = z.object({ courseId: z.coerce.number().int().positive() });
const categoryIdParam = z.object({ id: z.coerce.number().int().positive() });
const studentIdParam = z.object({ studentId: z.coerce.number().int().positive() });

const categoryCreate = z.object({
  name: z.string().trim().min(1).max(128),
  weight: z.coerce.number().min(0).max(100).optional().default(0),
  position: z.coerce.number().int().min(0).optional().default(0),
  description: z.string().trim().max(2000).optional().nullable(),
});

const categoryUpdate = categoryCreate.partial();

const recalculateBody = z.object({
  semesterId: z.coerce.number().int().positive().optional().nullable(),
  finalize: z.coerce.boolean().optional().default(false),
});

module.exports = {
  courseIdParam,
  categoryIdParam,
  studentIdParam,
  categoryCreate,
  categoryUpdate,
  recalculateBody,
};
