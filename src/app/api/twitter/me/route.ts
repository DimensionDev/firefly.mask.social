import type { NextRequest } from 'next/server.js';

import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { getJsonBodyFromRequestWithZodObject } from '@/helpers/getJsonBodyFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import { TwitterEditProfile } from '@/schemas/index.js';
import type { NextRequestContext } from '@/types/index.js';

type RequestFn = (request: NextRequest, context?: NextRequestContext) => Promise<Response>;

export const GET = compose<RequestFn>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const client = await createTwitterClientV2(request);
        const { data, errors } = await client.v2.me();
        if (errors?.length) {
            console.error('[twitter] v2.me', errors);
            return createTwitterErrorResponseJSON(errors);
        }

        return createSuccessResponseJSON(data);
    },
);

export const PUT = compose<RequestFn>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request) => {
        const params = await getJsonBodyFromRequestWithZodObject(request, TwitterEditProfile);
        const client = await createTwitterClientV2(request);
        await client.v1.updateAccountProfile(params);
        return createSuccessResponseJSON(null);
    },
);
