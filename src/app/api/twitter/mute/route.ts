import { NextRequest } from 'next/server.js';

import { TWITTER_MUTE_LIST_OPTIONS } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { Pageable } from '@/schemas/index.js';

export const GET = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, Pageable);
        const client = await createTwitterClientV2(request);
        const { data: me } = await client.v2.me();
        const { data } = await client.v2.userMutingUsers(me.id, {
            ...TWITTER_MUTE_LIST_OPTIONS,
            pagination_token: queryParams.cursor ? queryParams.cursor : undefined,
            max_results: queryParams.limit,
        });

        return createSuccessResponseJSON(data);
    },
);
