import { compose } from '@masknet/shared-base';
import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';
import { z, ZodError } from 'zod';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import {
    getSearchParamsFromRequestWithZodObject,
} from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { handleZodErrorMessage } from '@/helpers/handleZodErrorMessage.js';

const searchParamsSchemas = z.object({
    cursor: z.string().optional(),
    limit: z.string().optional().refine((value) => {
        if (value) {
            z.number().int().min(1).parse(Number(value))
        }
        return true
    }),
})


export const GET = compose<(request: NextRequest) => Promise<Response>>(
    // TODO: error handling function
    async (request: NextRequest) => {
        try {
            const queryParams = getSearchParamsFromRequestWithZodObject(request, searchParamsSchemas)
            const client = await createTwitterClientV2(request);
            const { data } = await client.v2.homeTimeline({
                expansions: ['attachments.media_keys', 'attachments.poll_ids', 'author_id'],
                'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
                'tweet.fields': ['text', 'attachments', 'author_id', 'created_at', 'lang'],
                'user.fields': ['profile_image_url', 'name', 'username'],
                pagination_token: queryParams.cursor ?? undefined
            });

            return createSuccessResponseJSON(data);
        } catch (error) {
            if (error instanceof ZodError) {
                return createErrorResponseJSON(handleZodErrorMessage(error), {
                    status: StatusCodes.BAD_REQUEST,
                });
            }
            console.log('[twitter]: homeTimeline/ error', error);
            return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    }
)


