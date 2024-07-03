import { compose } from '@masknet/shared-base';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { decodeActionUrl } from '@/helpers/parseBlinksFromContent.js';
import { parseURL } from '@/helpers/parseURL.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { ActionGetResponse, ActionRuleResponse } from '@/providers/types/Blink.js';

/**
 * reference: https://solana.com/docs/advanced/actions#actionsjson
 */
function resolveActionJson(url: string, actions: ActionRuleResponse) {
    const urlObj = parseURL(url);
    if (!urlObj) throw new Error('Invalid blink');
    const paths = urlObj.pathname.split('/');
    for (const rule of actions.rules) {
        const pathPatterns = rule.pathPattern.split('/');
        for (let i = 0; i < pathPatterns.length; i += 1) {
            const pathPattern = pathPatterns[i];
            if (pathPattern === '**') {
                pathPatterns[i] = paths.slice(i).join('/');
                continue;
            }
            if (pathPattern === '*') {
                pathPatterns[i] = paths[i];
                continue;
            }
            if (pathPattern !== paths[i]) break;
        }
        const newPath = pathPatterns.join('/');
        if (newPath !== rule.pathPattern) return rule.apiPath.replace(rule.pathPattern, pathPatterns.join('/'));
    }
    return null;
}

/**
 * reference: https://docs.dialect.to/documentation/actions/blinks/detecting-actions-via-url-schemes
 */
export const GET = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const { url } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: z.string(),
        }),
    );
    // 1. Sharing an explicit Action URL
    if (url.startsWith(SOLANA_BLINK_PREFIX)) {
        const urlWithoutPrefix = url.substring(SOLANA_BLINK_PREFIX.length);
        const response = await fetchJSON<ActionGetResponse>(urlWithoutPrefix, { method: 'GET' });
        return createSuccessResponseJSON(response);
    }
    // 3. Interstitial
    const decodedActionUrl = decodeActionUrl(url);
    if (decodedActionUrl.isBlink) {
        const response = await fetchJSON<ActionGetResponse>(decodedActionUrl.decodedActionUrl, { method: 'GET' });
        return createSuccessResponseJSON(response);
    }

    // 2. Sharing a link to a website that is linked to an actions API via an actions.json file on the website root domain.
    const urlObj = parseURL(url);
    if (!urlObj) throw new Error('Invalid blink');
    const actionJson = await fetchJSON<ActionRuleResponse>(
        urlcat(urlObj.origin, 'actions.json'),
        {
            method: 'GET',
        },
        { noDefaultContentType: true },
    );
    const matchedApiUrl = resolveActionJson(url, actionJson) ?? url;
    const response = await fetchJSON<ActionGetResponse>(matchedApiUrl, { method: 'GET' });
    return createSuccessResponseJSON(response);
});
