import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { ZodError } from 'zod';

import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { handleZodErrorMessage } from '@/helpers/handleZodErrorMessage.js';

export class UnauthorizedError extends Error {
    constructor(message?: string) {
        super(message ?? 'Unauthorized');
    }
}

export function withRequestErrorHandler(handler: (request: NextRequest, ...other: any[]) => Promise<Response>) {
    return async (request: NextRequest, ...other: any[]) => {
        try {
            return await handler(request, ...other);
        } catch (error) {
            if (error instanceof ZodError) {
                return createErrorResponseJSON(handleZodErrorMessage(error), {
                    status: StatusCodes.BAD_REQUEST,
                });
            }
            if (error instanceof UnauthorizedError) {
                return createErrorResponseJSON(error.message, {
                    status: StatusCodes.UNAUTHORIZED,
                });
            }
            return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    };
}
