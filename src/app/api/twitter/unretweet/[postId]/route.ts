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
        if (errors?.length) return createTwitterErrorResponseJSON(errors);

        const { errors: unretweetErrors } = await client.v2.unretweet(me.id, postId);
        if (unretweetErrors?.length) return createTwitterErrorResponseJSON(unretweetErrors);

        return createSuccessResponseJSON(true);
    },
);
