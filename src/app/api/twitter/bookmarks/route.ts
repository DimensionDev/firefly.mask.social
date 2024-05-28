import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { Pageable } from '@/schemas/Pageable.js';

export const GET = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, Pageable);

        const client = await createTwitterClientV2(request);
        const limit = queryParams.limit || 25;
        const { data } = await client.v2.bookmarks({
            max_results: limit,
            pagination_token: queryParams.cursor || undefined,
        });
        return createSuccessResponseJSON(data);
    },
);
