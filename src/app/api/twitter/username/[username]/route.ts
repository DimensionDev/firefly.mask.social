import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
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
        const username = context?.params.username;
        if (!username) throw new MalformedError('username not found');

        const client = await createTwitterClientV2(request);
        const { data } = await client.v2.userByUsername(username, {
            'user.fields': ['description', 'username', 'name', 'profile_image_url', 'public_metrics'],
        });
        return createSuccessResponseJSON(data);
    },
);
