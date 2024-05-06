import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

interface Params {
    userId: string;
}

export const GET = compose<(request: NextRequest, context: { params: Params }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, { params: { userId } }) => {
        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.user(userId, {
            'user.fields': [
                'description',
                'username',
                'name',
                'profile_image_url',
                'public_metrics',
                'connection_status',
            ],
        });
        return createSuccessResponseJSON(data);
    },
);
