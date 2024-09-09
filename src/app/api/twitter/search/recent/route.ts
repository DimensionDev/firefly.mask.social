import { NextRequest } from 'next/server.js';
import { z } from 'zod';

import { TWITTER_TIMELINE_OPTIONS } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

const SearchPageable = z.object({
    query: z.string().min(1),
    cursor: z.string().optional(),
    limit: z.coerce
        .number()
        .default(25)
        .refine((value) => {
            if (value) z.coerce.number().int().min(1).parse(value);
            return true;
        }),
});

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const queryParams = getSearchParamsFromRequestWithZodObject(request, SearchPageable);

        const client = await createTwitterClientV2(request);
        const { data, errors } = await client.v2.search(queryParams.query, {
            ...TWITTER_TIMELINE_OPTIONS,
            next_token: queryParams.cursor ? queryParams.cursor : undefined,
            max_results: queryParams.limit,
        });
        if (errors?.length) console.error('[twitter] v2.search', errors);

        return createSuccessResponseJSON(data);
    },
);
