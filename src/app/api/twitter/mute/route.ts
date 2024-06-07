import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { TWITTER_MUTE_LIST_OPTIONS } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { Pageable } from '@/schemas/index.js';

export const GET = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request: NextRequest) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, Pageable);
        const client = await createTwitterClientV2(request);
        const limit = Number(queryParams.limit ?? '20');
        const { data: me } = await client.v2.me();
        const { data } = await client.v2.userMutingUsers(me.id, {
            ...TWITTER_MUTE_LIST_OPTIONS,
            pagination_token: queryParams.cursor ? queryParams.cursor : undefined,
            max_results: limit,
        });

        return createSuccessResponseJSON(data);
    },
);
