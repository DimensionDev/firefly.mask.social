import type { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { SPACE_OPTIONS } from '@/constants/twitter.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createAppOnlyTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const spaceId = context?.params.spaceId;
        if (!spaceId) throw new MalformedError('spaceId not found');
        const client = await createAppOnlyTwitterClientV2(request);
        const space = await client.v2.space(spaceId, {
            ...SPACE_OPTIONS,
        });
        return createSuccessResponseJSON(space);
    },
);
