import { getReasonPhrase } from 'http-status-codes';
import { type NextRequest, NextResponse } from 'next/server.js';
import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createResponseJSON } from '@/helpers/createResponseJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';

export const GET = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    const res = await fetch(url, {
        method: 'GET',
    });
    const headers = Array.from(res.headers.entries())
        .filter(([key]) => key.startsWith('x-'))
        .reduce((acc, [key, value]) => {
            acc.set(key, value);
            return acc;
        }, new Headers());
    return NextResponse.json(await res.json(), {
        status: res.status,
        statusText: getReasonPhrase(res.status),
        headers,
    });
});

export const POST = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    const body = await request.json();
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return createResponseJSON(await res.json(), {
        status: res.status,
    });
});
