import { z } from 'zod';

export const pageableSchemas = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().refine((value) => {
        if (value) z.number().int().min(1).parse(Number(value))
        return true
    }),
})
