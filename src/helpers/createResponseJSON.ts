import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export function createResponseJSON(data: unknown, init?: Omit<ResponseInit, 'headers'>) {
    const status = init?.status ?? StatusCodes.OK;

    return Response.json(data, {
        status,
        statusText: getReasonPhrase(status),
    });
}
