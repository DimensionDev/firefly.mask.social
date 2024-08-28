import { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { TWITTER_UPLOAD_MEDIA_URL } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { GetUploadStatusResponse, UploadMediaResponse } from '@/types/twitter.js';

const FinishUploadSchema = z.object({
    media_id: z.string(),
});

// Finish upload
export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, FinishUploadSchema);

        const client = await createTwitterClientV2(request);
        const { media_id, media_id_string } = await client.post<UploadMediaResponse>(
            urlcat(TWITTER_UPLOAD_MEDIA_URL, { ...queryParams, command: 'FINALIZE' }),
        );

        return createSuccessResponseJSON({ media_id, media_id_string });
    },
);

// Get upload status
export const GET = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, FinishUploadSchema);

        const client = await createTwitterClientV2(request);
        const data = await client.get<GetUploadStatusResponse>(
            urlcat(TWITTER_UPLOAD_MEDIA_URL, { ...queryParams, command: 'STATUS' }),
        );

        return createSuccessResponseJSON(data);
    },
);
