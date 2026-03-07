import { z } from 'zod'

export const searchSchema = z
  .object({
    zipCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/, 'ZIP code must be a 5-digit string')
      .optional()
      .or(z.literal('')),
    city: z.string().trim().optional().or(z.literal('')),
    state: z
      .string()
      .trim()
      .regex(/^[A-Z]{2}$/, 'State must be a 2-letter uppercase code')
      .optional()
      .or(z.literal('')),
    taxonomyCode: z
      .string()
      .trim()
      .regex(/^[A-Z0-9]{10}$/, 'Taxonomy code must be a 10-character alphanumeric code')
      .optional()
      .or(z.literal('')),
    taxonomyDescription: z
      .string()
      .trim()
      .max(120, 'Taxonomy must be 120 characters or fewer')
      .optional()
      .or(z.literal('')),
    providerType: z.union([z.literal(1), z.literal(2)]).optional(),
  })
  .superRefine((value, context) => {
    const hasZipCode = Boolean(value.zipCode)
    const hasCity = Boolean(value.city)
    const hasState = Boolean(value.state)

    if (!hasZipCode && !hasState) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide a ZIP code, or a state, or a city together with a state.',
        path: ['zipCode'],
      })
    }

    if (hasCity && !hasState) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'State is required when city is provided.',
        path: ['state'],
      })
    }
  })

export const bulkSchema = searchSchema.extend({
  batchSize: z.coerce.number().int().min(50).max(200).default(200),
})

export type SearchFormValues = z.infer<typeof searchSchema>
export type BulkFormValues = z.infer<typeof bulkSchema>
