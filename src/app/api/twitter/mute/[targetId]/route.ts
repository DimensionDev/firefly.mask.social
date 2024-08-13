import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { createTwitterErrorResponseJSON } from '@/helpers/createTwitterErrorResponse.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const POST = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const targetId = context?.params.targetId;
        if (!targetId) throw new MalformedError('targetId not found');

        const client = await createTwitterClientV2(request);
        const { data: me, errors } = await client.v2.me();
        if (errors?.length) {
            console.error('[twitter] v2.me', errors);
            return createTwitterErrorResponseJSON(errors);
        }

        const { data, errors: muteErrors } = await client.v2.mute(me.id, targetId);
        if (muteErrors?.length) {
            console.error('[twitter] v2.mute', muteErrors);
            return createTwitterErrorResponseJSON(muteErrors);
        }

        return createSuccessResponseJSON(data);
    },
);

export const DELETE = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const targetId = context?.params.targetId;
        if (!targetId) throw new MalformedError('targetId not found');

        const client = await createTwitterClientV2(request);
        const { data: me, errors } = await client.v2.me();
        if (errors?.length) {
            console.error('[twitter] v2.me', errors);
            return createTwitterErrorResponseJSON(errors);
        }

        const { data, errors: unmuteErrors } = await client.v2.unmute(me.id, targetId);
        if (unmuteErrors?.length) {
            console.error('[twitter] v2.unmute', unmuteErrors);
            return createTwitterErrorResponseJSON(unmuteErrors);
        }

        return createSuccessResponseJSON(data);
    },
);
