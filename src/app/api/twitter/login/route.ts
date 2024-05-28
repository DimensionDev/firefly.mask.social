import { compose } from '@masknet/shared-base';
import { NextRequest } from 'next/server.js';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const POST = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        return createSuccessResponseJSON(true);
    },
);
