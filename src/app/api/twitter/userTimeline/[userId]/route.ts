import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { TWITTER_TIMELINE_OPTIONS } from '@/constants/index.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { pageableSchemas } from '@/helpers/pageableSchemas.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const GET = compose<(request: NextRequest, context: { params: { userId: string } }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, { params: { userId } }) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, pageableSchemas);
        const client = await createTwitterClientV2(request);
        const limit = Number(queryParams.limit ?? '25');
        const { data } = await client.v2.userTimeline(userId, {
            ...TWITTER_TIMELINE_OPTIONS,
            pagination_token: queryParams.cursor ? queryParams.cursor : undefined,
            max_results: limit,
        });
        return createSuccessResponseJSON(data);
    },
);
