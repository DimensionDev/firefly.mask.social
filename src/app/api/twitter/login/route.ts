import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterSessionPayload } from '@/helpers/createTwitterSessionPayload.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { TwitterSession } from '@/providers/twitter/Session.js';

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const payload = await createTwitterSessionPayload(request);
        if (!payload) return createSuccessResponseJSON(null);
        return createSuccessResponseJSON(TwitterSession.concealPayload(payload));
    },
);
