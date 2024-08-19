import { z, ZodError, ZodIssueCode } from 'zod';

import { Source } from '@/constants/enum.js';
import {
    ALLOWED_MEDIA_MIMES,
    MAX_PROFILE_BIO_SIZE,
    MAX_PROFILE_DISPLAY_NAME_SIZE,
    MAX_PROFILE_LOCATION_SIZE,
    MAX_PROFILE_WEBSITE_SIZE,
} from '@/constants/index.js';
import { isValidFileType } from '@/helpers/isValidFileType.js';

export const Pageable = z.object({
    cursor: z.string().optional(),
    limit: z.coerce
        .number()
        .default(25)
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

export const FileSchema = z.custom<File>((value) => {
    if (!(value instanceof File)) {
        throw new ZodError([
            {
                message: `The file not found`,
                path: [],
                code: ZodIssueCode.invalid_type,
                expected: 'object',
                received: typeof value,
            },
        ]);
    }
    if (!isValidFileType(value.type)) {
        throw new ZodError([
            {
                message: `Invalid file type. Allowed types: ${ALLOWED_MEDIA_MIMES.join(', ')}`,
                path: [],
                code: ZodIssueCode.invalid_type,
                expected: 'string',
                received: 'string',
            },
        ]);
    }
    return value;
});

export const TwitterEditProfile = z.object({
    name: z.string().min(1).max(MAX_PROFILE_DISPLAY_NAME_SIZE[Source.Twitter]).optional(),
    description: z.string().min(1).max(MAX_PROFILE_BIO_SIZE[Source.Twitter]).optional(),
    location: z.string().min(0).max(MAX_PROFILE_LOCATION_SIZE[Source.Twitter]).optional(),
    url: z.string().min(0).max(MAX_PROFILE_WEBSITE_SIZE[Source.Twitter]).optional(),
});
