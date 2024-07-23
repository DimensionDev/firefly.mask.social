import { StatusCodes } from 'http-status-codes';
import { NextRequest } from 'next/server.js';

import { MalformedError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { createTwitterClientV2 } from '@/helpers/createTwitterClientV2.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { withTwitterRequestErrorHandler } from '@/helpers/withTwitterRequestErrorHandler.js';
import type { NextRequestContext } from '@/types/index.js';

export const GET = compose<(request: NextRequest, context?: NextRequestContext) => Promise<Response>>(
    withRequestErrorHandler({ throwError: true }),
    withTwitterRequestErrorHandler,
    async (request, context) => {
        const userId = context?.params.userId;
        if (!userId) throw new MalformedError('userId not found');

        const client = await createTwitterClientV2(request);
        const { data, errors } = await client.v2.user(userId, {
            'user.fields': [
                'description',
                'username',
                'name',
                'profile_image_url',
                'public_metrics',
                'connection_status',
            ],
        });

        if (errors && errors.length > 0) {
            for (const error of errors) {
                if (error.title === 'Forbidden') {
                    return createErrorResponseJSON(error.detail, {
                        status: StatusCodes.FORBIDDEN,
                    });
                }
                createErrorResponseJSON(error.detail);
            }
        }
        return createSuccessResponseJSON(data);
    },
);
