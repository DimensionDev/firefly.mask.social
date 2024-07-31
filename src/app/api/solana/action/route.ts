import { safeUnreachable } from '@masknet/kit';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { KeyType } from '@/constants/enum.js';
import { FetchError, NotFoundError, UnreachableError } from '@/constants/error.js';
import { compose } from '@/helpers/compose.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { memoizeWithRedis } from '@/helpers/memoizeWithRedis.js';
import { parseURL } from '@/helpers/parseURL.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { ActionGetResponse, ActionRuleResponse } from '@/providers/types/Blink.js';
import { HttpUrl } from '@/schemas/index.js';
import { type Action, type ActionComponent, type ActionParameter, SchemeType } from '@/types/blink.js';

/**
 * reference: https://solana.com/docs/advanced/actions#actionsjson
 */
function resolveActionJson(url: string, actions: ActionRuleResponse) {
    const u = parseURL(url);
    if (!u) return null;

    const paths = u.pathname.split('/');

    for (const rule of actions.rules) {
        const pathPatterns = rule.pathPattern.split('/');
        let end = '';
        for (let i = 0; i < pathPatterns.length; i += 1) {
            const pathPattern = pathPatterns[i];
            if (pathPattern === '**') {
                end = paths.slice(i).join('/');
                pathPatterns[i] = end;
                continue;
            }
            if (pathPattern === '*') {
                pathPatterns[i] = paths[i];
                continue;
            }
            if (pathPattern !== paths[i]) break;
        }
        const newPath = pathPatterns.join('/');
        if (newPath !== rule.pathPattern) {
            const apiPath = rule.apiPath.replace(rule.pathPattern, pathPatterns.join('/')).replace('**', end);
            const resultUrl = apiPath.startsWith('https://') ? apiPath : urlcat(u.origin, apiPath);
            return resultUrl + u.search;
        }
    }
    return null;
}

function createActionComponent(label: string, href: string, parameters?: ActionParameter[]): ActionComponent {
    return {
        label,
        href,
        parameters: parameters ?? [],
        parameter: parameters?.[0],
    };
}

function createAction(url: string, data: ActionGetResponse, blink: string) {
    const PREFIX = 'solana://';
    const websiteUrl = blink.startsWith(PREFIX) ? blink.substring(PREFIX.length) : url;
    const actionResult: Action = {
        url,
        websiteUrl,
        icon: data.icon,
        title: data.title,
        description: data.description,
        disabled: data.disabled ?? false,
        actions: [],
    };
    if (data.links?.actions) {
        const u = parseURL(url);
        if (!u) return null;

        actionResult.actions = data.links.actions.map((action) => {
            const href = action.href.startsWith('https://') ? action.href : urlcat(u.origin, action.href);
            return createActionComponent(action.label, href, action.parameters);
        });
    } else {
        actionResult.actions = [createActionComponent(data.label, url)];
    }
    return actionResult;
}

const cacheBlinkResolver = (url: string, type: SchemeType, blink: string) => `${url}:${type}:${blink}`;

const queryBlink = memoizeWithRedis(
    async (url: string, type: SchemeType, blink: string, signal: AbortSignal) => {
        switch (type) {
            case SchemeType.ActionUrl:
            case SchemeType.Interstitial: {
                const response = await fetchJSON<ActionGetResponse>(url, { method: 'GET', signal });
                if (response?.error) throw new Error(response.error.message);
                return createAction(url, response, blink);
            }
            case SchemeType.ActionsJson: {
                const u = parseURL(url);
                if (!u) return null;
                const actionJson = await fetchJSON<ActionRuleResponse>(
                    urlcat(u.origin, 'actions.json'),
                    {
                        method: 'GET',
                        signal,
                    },
                    { noDefaultContentType: true },
                );
                const matchedApiUrl = resolveActionJson(url, actionJson) ?? url;
                const response = await fetchJSON<ActionGetResponse>(matchedApiUrl, {
                    method: 'GET',
                    signal,
                });
                if (response?.error) throw new Error(response.error.message);
                return createAction(matchedApiUrl, response, blink);
            }
            default:
                safeUnreachable(type);
                throw new UnreachableError('scheme type', type);
        }
    },
    {
        key: KeyType.GetBlink,
        resolver: cacheBlinkResolver,
    },
);

/**
 * reference: https://docs.dialect.to/documentation/actions/blinks/detecting-actions-via-url-schemes
 */
export const GET = compose(withRequestErrorHandler(), async (request) => {
    const { url, type, blink } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: HttpUrl,
            type: z.nativeEnum(SchemeType),
            blink: z.string(),
        }),
    );

    try {
        const response = await queryBlink(url, type, blink, request.signal);
        if (!response) throw new NotFoundError();
        return createSuccessResponseJSON(response);
    } catch (error) {
        if (
            error instanceof SyntaxError ||
            error instanceof TypeError ||
            // client error
            (error instanceof FetchError && error.status >= 400 && error.status < 500)
        ) {
            throw new NotFoundError();
        }
        throw error;
    }
});

export async function DELETE(request: NextRequest) {
    const { url, type, blink } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: HttpUrl,
            type: z.nativeEnum(SchemeType),
            blink: z.string(),
        }),
    );
    await queryBlink.cache.delete(cacheBlinkResolver(url, type, blink));
    return createSuccessResponseJSON(null);
}
