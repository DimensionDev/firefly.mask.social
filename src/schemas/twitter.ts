import { z } from 'zod';

export const TwitterEditProfile = z.object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().min(1).max(160).optional(),
    location: z.string().min(1).max(30).optional(),
    url: z.string().min(1).max(100).optional(),
});
