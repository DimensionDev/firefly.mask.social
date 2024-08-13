import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { TWITTER_USER_OPTIONS } from '@/constants/index.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const userId = context?.params.userId;
        if (!userId) throw new MalformedError('userId not found');

        const client = await createTwitterClientV2(request);
        const { data, errors } = await client.v2.user(userId, {
            ...TWITTER_USER_OPTIONS,
        });
        if (errors?.length) console.error('[twitter] v2.user', errors);

        return createSuccessResponseJSON(data);
    },
);
