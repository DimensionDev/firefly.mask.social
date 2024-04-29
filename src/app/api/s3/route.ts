import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { t } from '@lingui/macro';
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';

class ParameterError extends Error {}

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];

const fileSchema = z.custom((value) => {
    if (!(value instanceof File)) {
        throw new ParameterError(t`The file not found`);
    }
    if (!ALLOWED_MIMES.includes(value.type)) {
        throw new ParameterError(t`Invalid file type. Allowed types: ${ALLOWED_MIMES.join(', ')}`);
    }
    return value;
});

export async function PUT(req: NextRequest) {
    try {
        const formData = await req.formData().catch(() => {
            throw new ParameterError(t`The file not found`);
        });
        const file = formData.get('file') as File;
        fileSchema.parse(file);
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
            Key: uuid(),
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
        if (error instanceof ParameterError) {
            return createErrorResponseJSON(error.message, {
                status: StatusCodes.BAD_REQUEST,
            });
        }
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
