import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';

export async function GET(request: NextRequest) {
    try {
        // TODO: params pageable
        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.homeTimeline({
            'expansions': ['attachments.media_keys', 'attachments.poll_ids', 'author_id'],
            'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
            'tweet.fields': ['text', 'attachments', 'author_id', 'created_at', 'lang'],
            'user.fields': ['profile_image_url', 'name', 'username'],
        });

        return createSuccessResponseJSON(data);
    } catch (error) {
        console.log('[twitter]: homeTimeline/ error', error);
        return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}
