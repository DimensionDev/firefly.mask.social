import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { getTwitterErrorMessage } from '@/helpers/getTwitterErrorMessage.js';

export function withTwitterRequestErrorHandler(handler: (request: NextRequest, ...other: any[]) => Promise<Response>)  {
    return async (request: NextRequest, ...other: any[]) => {
        try {
            return await handler(request, ...other);
        } catch (error) {
            return createErrorResponseJSON(getTwitterErrorMessage(error), {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };
}
