import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

export const POST = compose<(request: NextRequest, context: { params: { targetId: string } }) => Promise<Response>>(
    withRequestErrorHandler,
    async (request, { params: { targetId } }) => {
        const client = await createTwitterClientV2(request);
        const { data: me } = await client.v2.me();
        await client.v2.retweet(me.id, targetId);
        return createSuccessResponseJSON(true);
    },
);
