import { NextRequest } from 'next/server.js';

import { UnauthorizedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterSessionPayload } from '@/helpers/createTwitterSessionPayload.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { encrypt } from '@/services/crypto.js';
import type { NextRequestContext } from '@/types/index.js';

export const POST = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const payload = await createTwitterSessionPayload(request);
        if (!payload) throw new UnauthorizedError();

        const data = encrypt(
            JSON.stringify({
                consumer_key: payload.consumerKey,
                consumer_secret: payload.consumerSecret,
                access_token: payload.accessToken,
                access_token_secret: payload.accessTokenSecret,
            }),
        );
        return createSuccessResponseJSON(data);
    },
);
