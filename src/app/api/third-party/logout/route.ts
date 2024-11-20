import type { NextRequest } from 'next/server.js';

import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        // TODO: clean third party oauth token for next-auth cookie
        return createSuccessResponseJSON(null, {
            headers: {
                'Set-Cookie': `thirdPartyToken=; path=/; Max-Age=-1; SameSite=Lax; Secure;}`,
            },
        });
    },
);
