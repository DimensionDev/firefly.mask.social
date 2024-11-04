import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export function createResponseJSON(data: unknown, init?: ResponseInit) {
    const status = init?.status ?? StatusCodes.OK;

    return Response.json(data, {
        status,
        statusText: getReasonPhrase(status),
        ...init,
    });
}

export enum ServerErrorCodes {
    UNKNOWN = 40001,
}

export function createErrorResponseJSON(message: string, init?: Omit<ResponseInit, 'headers'>) {
    return createResponseJSON(
        {
            success: false,
            error: {
                code: ServerErrorCodes.UNKNOWN,
                message,
            },
        },
        {
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            ...init,
        },
    );
}

export function createSuccessResponseJSON(data: unknown, init?: ResponseInit) {
    return createResponseJSON(
        {
            success: true,
            data,
        },
        {
            status: StatusCodes.OK,
            ...init,
        },
    );
}
