import { produce } from 'immer';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { compose } from '@/helpers/compose.js';
import { createErrorResponseJSON } from '@/helpers/createErrorResponseJSON.js';
import { createResponseJSON } from '@/helpers/createResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { parseURL } from '@/helpers/parseURL.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import { settings } from '@/settings/index.js';
import type { FireflyBlinkParserBlinkResponse } from '@/types/blink.js';

export const GET = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    const response = await fetchJSON<FireflyBlinkParserBlinkResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/solana/blinks/parse'),
        {
            method: 'POST',
            body: JSON.stringify({ url }),
        },
    );
    if (!response.data) return createErrorResponseJSON('Action not found');

    return createResponseJSON(
        produce(response.data.action, (action) => {
            const actionApiUrl = response.data!.actionApiUrl;
            action.url = response.data!.actionUrl;
            action.apiUrl = actionApiUrl;
            if (action.links?.actions) {
                for (const x of action.links.actions) {
                    x.href = x.href.startsWith('http') ? x.href : urlcat(parseURL(actionApiUrl)!.origin, x.href);
                }
            }
        }),
    );
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
