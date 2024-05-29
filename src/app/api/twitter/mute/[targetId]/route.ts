import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const POST = compose<(request: NextRequest, context: { params: { targetId: string } }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request: NextRequest, { params: { targetId } }) => {
        const client = await createTwitterClientV2(request);
        const { data: me } = await client.v2.me();
        const { data } = await client.v2.mute(me.id, targetId);

        return createSuccessResponseJSON(data);
    },
);

export const DELETE = compose<(request: NextRequest, context: { params: { targetId: string } }) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request: NextRequest, { params: { targetId } }) => {
        const client = await createTwitterClientV2(request);
        const { data: me } = await client.v2.me();
        const { data } = await client.v2.unmute(me.id, targetId);

        return createSuccessResponseJSON(data);
    },
);
