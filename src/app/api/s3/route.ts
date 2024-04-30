import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { t } from '@lingui/macro';
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { v4 as uuid } from 'uuid';
import { z, ZodError, ZodIssueCode } from 'zod';

import { SourceInURL } from '@/constants/enum.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'] as const;

type AllowedMime = (typeof ALLOWED_MIMES)[number];

class ContentTypeError extends Error {}

const SUFFIX_NAMES: Record<AllowedMime, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
};

const FormDataSchema = z.object({
    file: z.custom<File>((value) => {
        if (!(value instanceof File)) {
            throw new ZodError([
                {
                    message: t`The file not found`,
                    path: [],
                    code: ZodIssueCode.invalid_type,
                    expected: 'object',
                    received: typeof value,
                },
            ]);
        }
        if (!ALLOWED_MIMES.includes(value.type as AllowedMime)) {
            throw new ZodError([
                {
                    message: t`Invalid file type. Allowed types: ${ALLOWED_MIMES.join(', ')}`,
                    path: [],
                    code: ZodIssueCode.invalid_type,
                    expected: 'string',
                    received: 'string',
                },
            ]);
        }
        return value;
    }),
    source: z.nativeEnum(SourceInURL),
});

export async function PUT(req: NextRequest) {
    try {
        const formData = await req.formData().catch((error) => {
            throw new ContentTypeError(error.message);
        });
        const { file, source } = FormDataSchema.parse({
            file: formData.get('file'),
            source: formData.get('source'),
        });
        const client = new S3Client({
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
            },
            maxAttempts: 5,
        });
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${source.toLowerCase()}/${uuid()}.${SUFFIX_NAMES[file.type as AllowedMime]}`,
            Body: file,
            ContentType: file.type,
        };
        const task = new Upload({
            client,
            params,
        });
        await task.done();
        return createSuccessResponseJSON({
            link: `https://${process.env.S3_HOST}/${params.Key}`,
        });
    } catch (error) {
        if (error instanceof ContentTypeError) {
            return createErrorResponseJSON(error.message, {
                status: StatusCodes.BAD_REQUEST,
            });
        }
        if (error instanceof ZodError) {
            const message =
                'InvalidParams: ' +
                error.issues.map((issue) => `(${issue.code})${issue.path.join('.')}: ${issue.message}`).join('; ');
            return createErrorResponseJSON(message, {
                status: StatusCodes.BAD_REQUEST,
            });
        }
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
