import { NextRequest } from 'next/server.js';

import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';

export const POST = compose<(request: NextRequest) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        // TODO: read third party oauth token for next-auth cookie
        // TODO: invoke firefly API along with the token to get the account details
        return createSuccessResponseJSON({}, {
            headers: {
                'Set-Cookie': `thirdPartyToken=${btoa(JSON.stringify({}))}; path=/; Max-Age=31536000; SameSite=Lax; Secure;}`,
            },
        });
    },
);
