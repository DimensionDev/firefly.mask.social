import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { ZodError } from 'zod';

import { MalformedError, UnauthorizedError } from '@/constants/error.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { handleZodErrorMessage } from '@/helpers/handleZodErrorMessage.js';
import type { NextRequestContext } from '@/types/index.js';

export function withRequestErrorHandler(options?: { throwError?: boolean }) {
    const { throwError = false } = options ?? {};
    return (handler: (request: NextRequest, context?: NextRequestContext) => Promise<Response>) => {
        return async (request: NextRequest, context?: NextRequestContext) => {
            try {
                return await handler(request, context);
            } catch (error) {
                if (error instanceof ZodError) {
                    return createErrorResponseJSON(handleZodErrorMessage(error), {
                        status: StatusCodes.BAD_REQUEST,
                    });
                }
                if (error instanceof MalformedError) {
                    return createErrorResponseJSON(error.message, {
                        status: StatusCodes.BAD_REQUEST,
                    });
                }
                if (error instanceof UnauthorizedError) {
                    return createErrorResponseJSON(error.message, {
                        status: StatusCodes.UNAUTHORIZED,
                    });
                }
                if (!throwError) {
                    return createErrorResponseJSON(error instanceof Error ? error.message : 'Internal Server Error', {
                        status: StatusCodes.INTERNAL_SERVER_ERROR,
                    });
                }
                throw error;
            }
        };
    };
}
