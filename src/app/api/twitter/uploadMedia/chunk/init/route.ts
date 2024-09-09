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
import type { UploadMediaResponse } from '@/types/twitter.js';

const InitMediaSchema = z.object({
    total_bytes: z.string(),
    media_type: z.string(),
    media_category: z.string().optional(),
    additional_owners: z.string().optional(),
});

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, InitMediaSchema);

        const client = await createTwitterClientV2(request);
        const { media_id_string } = await client.post<UploadMediaResponse>(
            urlcat(TWITTER_UPLOAD_MEDIA_URL, {
                ...queryParams,
                command: 'INIT',
            }),
        );

        return createSuccessResponseJSON({ media_id: media_id_string, media_id_string });
    },
);
