import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { getTwitterErrorMessage } from '@/helpers/getTwitterErrorMessage.js';
import type { NextRequestContext } from '@/types/index.js';

export function withTwitterRequestErrorHandler(
    handler: (request: NextRequest, context?: NextRequestContext) => Promise<Response>,
) {
    return async (request: NextRequest, context?: NextRequestContext) => {
        try {
            return await handler(request, context);
        } catch (error) {
            const { status, message } = getTwitterErrorMessage(error);
            return createErrorResponseJSON(message, {
                status: status ?? StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };
}
