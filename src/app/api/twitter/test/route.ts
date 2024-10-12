import { NextRequest } from 'next/server.js';

import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createAppOnlyTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterSessionPayload } from '@/helpers/createTwitterSessionPayload.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const oldPayload = await createTwitterSessionPayload(request);
        await createAppOnlyTwitterClientV2(request);
        const newPayload = await createTwitterSessionPayload(request);

        return createSuccessResponseJSON({
            oldPayload,
            newPayload,
        });
    },
);
