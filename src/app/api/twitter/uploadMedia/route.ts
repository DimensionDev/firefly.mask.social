import { NextRequest } from 'next/server.js';
import type { UploadMediaV1Params } from 'twitter-api-v2';
import { z } from 'zod';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

const UploadSchema = z
    .object({
        type: z.string().optional(),
        mimeType: z.string().optional(),
        target: z.enum(['tweet', 'dm']).optional(),
        chunkLength: z.number().int().positive().optional(),
        shared: z.boolean().optional(),
        longVideo: z.boolean().optional(),
    })
    .optional();

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const options = (
            formData.get('options') ? parseJSON(formData.get('options') as string) : null
        ) as Partial<UploadMediaV1Params> | null;
        const parsedOptions = options ? UploadSchema.safeParse(options).data : {};
        if (!file) throw new MalformedError('file not found');

        const client = await createTwitterClientV2(request);
        const response = await client.v1.uploadMedia(Buffer.from(await file.arrayBuffer()), {
            mimeType: file.type,
            ...parsedOptions,
        });
        return createSuccessResponseJSON({ media_id: Number(response), media_id_string: response });
    },
);
