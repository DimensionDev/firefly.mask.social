import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server.js';
import { ZodError } from 'zod';

import { ContentTypeError, MalformedError, NotFoundError, UnauthorizedError } from '@/constants/error.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import type { NextRequestContext } from '@/types/index.js';

function handleZodErrorMessage(error: ZodError) {
    return (
        'InvalidParams: ' +
        error.issues.map((issue) => `(${issue.code})${issue.path.join('.')}: ${issue.message}`).join('; ')
    );
}

export function withRequestErrorHandler(options?: { throwError?: boolean }) {
    const { throwError = false } = options ?? {};
    return (handler: (request: NextRequest, context?: NextRequestContext) => Promise<Response>) => {
        return async (request: NextRequest, context?: NextRequestContext) => {
            try {
                return await handler(request, context);
            } catch (error) {
                if (error instanceof ContentTypeError) {
                    return createErrorResponseJSON(error.message, {
                        status: StatusCodes.BAD_REQUEST,
                    });
                }
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
                if (error instanceof NotFoundError) {
                    return createErrorResponseJSON(error.message, {
                        status: StatusCodes.NOT_FOUND,
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
