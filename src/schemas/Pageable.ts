import { z } from 'zod';

export const Pageable = z.object({
    cursor: z.string().optional(),
    limit: z.coerce
        .number()
        .optional()
        .refine((value) => {
            if (value) z.coerce.number().int().min(1).parse(value);
            return true;
        }),
});
