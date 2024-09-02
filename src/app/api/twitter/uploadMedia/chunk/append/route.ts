import { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { MalformedError } from '@/constants/error.js';
import { TWITTER_UPLOAD_MEDIA_URL } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

const AppendMediaSchema = z.object({
    media_id: z.string(),
    segment_index: z.string(),
});

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, AppendMediaSchema);

        const formData = await request.formData();
        const file = formData.get('media') as File | null;
        if (!file) throw new MalformedError('file not found');

        const client = await createTwitterClientV2(request);
        await client.post(
            urlcat(TWITTER_UPLOAD_MEDIA_URL, {
                ...queryParams,
                command: 'APPEND',
            }),
            {
                media: Buffer.from(await file.arrayBuffer()),
            },
        );

        return createSuccessResponseJSON({ media_id: queryParams.media_id, index: queryParams.segment_index });
    },
);
