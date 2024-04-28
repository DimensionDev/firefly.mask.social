import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { t } from '@lingui/macro';
import type { NextApiResponse } from 'next';
import type { NextRequest } from 'next/server.js';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

import { env } from '@/constants/env.js';

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

export async function PUT(req: NextRequest, res: NextApiResponse) {
    try {
        const formData = await req.formData().catch(() => {
            throw new ParameterError(t`The file not found`);
        });
        const file = formData.get('file') as File;
        fileSchema.parse(file)
        const client = new S3Client({
            region: env.internal.S3_REGION,
            credentials: {
                accessKeyId: env.internal.S3_ACCESS_KEY_ID,
                secretAccessKey: env.internal.S3_ACCESS_KEY_SECRET,
            },
            maxAttempts: 5,
        });
        const params = {
            Bucket: env.internal.S3_BUCKET,
            Key: uuid(),
            Body: file,
            ContentType: file.type,
        };
        const task = new Upload({
            client,
            params,
        });
        await task.done();
        return Response.json({
            link: `https://${env.internal.S3_HOST}/${params.Key}`,
        });
    } catch (error) {
        if (error instanceof ParameterError) {
            return Response.json(
                {
                    error: error.message,
                },
                {
                    status: 400,
                },
            );
        }
        return Response.json(
            {
                error: t`Unknown error`,
            },
            {
                status: 500,
            },
        );
    }
}
