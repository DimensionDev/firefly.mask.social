import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const POST = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const postId = context?.params.postId;
        if (!postId) throw new MalformedError('postId not found');

        const client = await createTwitterClientV2(request);
        const { data: me } = await client.v2.me();
        await client.v2.unlike(me.id, postId);
        return createSuccessResponseJSON(true);
    },
);
