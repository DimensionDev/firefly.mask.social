import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

interface Params {
    username: string;
}

export const GET = compose<(request: NextRequest, context: { params: Params }) => Promise<Response>>(
    withRequestErrorHandler,
    async (request, { params: { username } }) => {
        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.userByUsername(username, {
            'user.fields': ['description', 'username', 'name', 'profile_image_url', 'public_metrics'],
        })
        return createSuccessResponseJSON(data)
    }
)
