import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { pageableSchemas } from '@/helpers/pageableSchemas.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

export const GET = compose<(request: NextRequest) => Promise<Response>>(withRequestErrorHandler, async (request) => {
    const queryParams = getSearchParamsFromRequestWithZodObject(request, pageableSchemas);
    const client = await createTwitterClientV2(request);
    const limit = Number(queryParams.limit ?? '25');
    const { data } = await client.v2.homeTimeline({
        expansions: ['attachments.media_keys', 'attachments.poll_ids', 'author_id'],
        'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
        'tweet.fields': ['text', 'attachments', 'author_id', 'created_at', 'lang'],
        'user.fields': ['profile_image_url', 'name', 'username'],
        pagination_token: queryParams.cursor ?? undefined,
        max_results: limit,
    });
    return createSuccessResponseJSON(data);
});
