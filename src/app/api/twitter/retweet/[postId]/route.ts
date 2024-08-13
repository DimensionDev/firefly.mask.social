import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const POST = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const postId = context?.params.postId;
        if (!postId) throw new MalformedError('targetId not found');

        const client = await createTwitterClientV2(request);
        const { data: me, errors } = await client.v2.me();
        if (errors?.length) {
            console.error('[twitter] v2.me', errors);
            return createTwitterErrorResponseJSON(errors);
        }

        const { errors: retweetErrors } = await client.v2.retweet(me.id, postId);
        if (retweetErrors?.length) {
            console.error('[twitter] v2.retweet', retweetErrors);
            return createTwitterErrorResponseJSON(retweetErrors);
        }

        return createSuccessResponseJSON(true);
    },
);
