import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),

  categoryType: z.enum(['INCOME', 'EXPENSE'], {
    message: 'Category type is required',
  }),

  displayOrder: z
    .number({
      message: 'Display order is required',
    })
    .int('Display order must be a whole number')
    .min(0, 'Display order cannot be negative')
    .max(32767, 'Display order is too large'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
