import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server.js';

export function createResponseJSON(data: unknown, init?: ResponseInit) {
    const status = init?.status ?? StatusCodes.OK;

    return new NextResponse(JSON.stringify(data), {
        status,
        statusText: getReasonPhrase(status),
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
}
