import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { v4 as uuid } from 'uuid';
import { z, ZodError } from 'zod';

import { SourceInURL } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { ContentTypeError } from '@/constants/error.js';
import { SUFFIX_NAMES } from '@/constants/index.js';
import { createErrorResponseJSON, createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetch } from '@/helpers/fetch.js';
import { getGatewayErrorMessage } from '@/helpers/getGatewayErrorMessage.js';
import { FileSchema } from '@/schemas/index.js';

const FormDataSchema = z.object({
    file: FileSchema,
    source: z.enum([SourceInURL.Farcaster, SourceInURL.Twitter, SourceInURL.Lens]),
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
            region: env.internal.S3_REGION,
            credentials: {
                accessKeyId: env.internal.S3_ACCESS_KEY_ID,
                secretAccessKey: env.internal.S3_ACCESS_KEY_SECRET,
            },
            maxAttempts: 5,
        });
        const params = {
            Bucket: env.internal.S3_BUCKET,
            Key: `${source.toLowerCase()}/${uuid()}.${SUFFIX_NAMES[file.type as keyof typeof SUFFIX_NAMES]}`,
            Body: file,
            ContentType: file.type,
        };
        const task = new Upload({
            client,
            params,
        });
        await task.done();
        return createSuccessResponseJSON({
            link: `https://${env.internal.S3_HOST}/${params.Key}`,
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
        return createErrorResponseJSON(getGatewayErrorMessage(error, 'Internal Server Error'), {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const path = req.nextUrl.searchParams.get('path');
        if (!path) {
            return createErrorResponseJSON('InvalidParams: path is required', {
                status: StatusCodes.BAD_REQUEST,
            });
        }

        if (!env.external.NEXT_PUBLIC_S3_API_KEY) {
            throw new Error('S3_API_KEY is not defined');
        }

        const url = urlcat('https://openapi-dev.firefly.land/media_invalid', {
            path,
        });

        await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': env.external.NEXT_PUBLIC_S3_API_KEY,
            },
        });

        return createSuccessResponseJSON({});
    } catch (error) {
        return createErrorResponseJSON(getGatewayErrorMessage(error, 'Internal Server Error'), {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
