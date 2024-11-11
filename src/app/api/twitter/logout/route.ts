import type { NextRequest } from 'next/server.js';

import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        return createSuccessResponseJSON(null, {
            headers: {
                'Set-Cookie': `twitterToken=; path=/; Max-Age=-1; SameSite=Lax; Secure;}`,
            },
        });
    },
);
