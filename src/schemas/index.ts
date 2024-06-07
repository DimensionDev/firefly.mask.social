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

export const HttpUrl = z
    .string()
    .url()
    .regex(/^(https?:\/\/)/);

export const CAIP10 = z.string().regex(/^eip155:\d+:0x[a-fA-F0-9]{40}/i);
