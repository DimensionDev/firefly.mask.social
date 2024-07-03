import { compose } from '@masknet/shared-base';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { parseURL } from '@/helpers/parseURL.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { ActionGetResponse, ActionRuleResponse } from '@/providers/types/Blink.js';
import { HttpUrl } from '@/schemas/index.js';
import { type Action, type ActionComponent, type ActionParameter, SchemeType } from '@/types/blink.js';

/**
 * reference: https://solana.com/docs/advanced/actions#actionsjson
 */
function resolveActionJson(url: string, actions: ActionRuleResponse) {
    const urlObj = parseURL(url);
    if (!urlObj) throw new Error('Invalid blink');
    const paths = urlObj.pathname.split('/');
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
            return apiPath.startsWith('https://') ? apiPath : `${urlObj.origin}${apiPath}`;
        }
    }
    return null;
}

function createActionComponent(label: string, href: string, parameters?: [ActionParameter]): ActionComponent {
    return {
        parameterValue: '',
        label,
        href,
        parameters: [],
        parameter: parameters?.[0],
    };
}

function createAction(url: string, data: ActionGetResponse, blink?: string) {
    const actionResult: Action = {
        url,
        websiteUrl: blink ?? url,
        icon: data.icon,
        title: data.title,
        description: data.description,
        disabled: data.disabled ?? false,
        actions: [],
    };
    if (data.links?.actions) {
        const u = parseURL(url);
        if (u) {
            actionResult.actions = data.links.actions.map((action) => {
                const href = action.href.startsWith('http') ? action.href : u.origin + action.href;
                return createActionComponent(action.label, href, action.parameters);
            });
        }
    } else {
        actionResult.actions = [createActionComponent(data.label, url)];
    }
    return actionResult;
}

/**
 * reference: https://docs.dialect.to/documentation/actions/blinks/detecting-actions-via-url-schemes
 */
export const GET = compose(withRequestErrorHandler(), async (request: NextRequest) => {
    const { url, type, blink } = getSearchParamsFromRequestWithZodObject(
        request,
        z.object({
            url: HttpUrl,
            type: z.nativeEnum(SchemeType),
            blink: HttpUrl.optional(),
        }),
    );
    switch (type) {
        case SchemeType.ActionUrl:
        case SchemeType.Interstitial: {
            const response = await fetchJSON<ActionGetResponse>(url, { method: 'GET' });
            return createSuccessResponseJSON(createAction(url, response, blink));
        }
        case SchemeType.ActionsJson: {
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
            return createSuccessResponseJSON(createAction(matchedApiUrl, response, blink));
        }
    }
});
