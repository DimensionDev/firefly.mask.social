import { safeUnreachable } from '@masknet/kit';
import { compose } from '@masknet/shared-base';
import type { NextRequest } from 'next/server.js';
import urlcat from 'urlcat';
import { z } from 'zod';

import { UnreachableError } from '@/constants/error.js';
import { createSuccessResponseJSON } from '@/helpers/createSuccessResponseJSON.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getSearchParamsFromRequestWithZodObject } from '@/helpers/getSearchParamsFromRequestWithZodObject.js';
import { withRequestErrorHandler } from '@/helpers/withRequestErrorHandler.js';
import type { ActionGetResponse, ActionRuleResponse } from '@/providers/types/Blink.js';
import { HttpUrl } from '@/schemas/index.js';
import { type Action, type ActionComponent, type ActionParameter, SchemeType } from '@/types/blink.js';

/**
 * reference: https://solana.com/docs/advanced/actions#actionsjson
 */
function resolveActionJson(url: string, actions: ActionRuleResponse) {
    const u = new URL(url);
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
            return apiPath.startsWith('https://') ? apiPath : urlcat(u.origin, apiPath);
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
        const u = new URL(url);
        actionResult.actions = data.links.actions.map((action) => {
            const href = action.href.startsWith('https://') ? action.href : urlcat(u.origin, action.href);
            return createActionComponent(action.label, href, action.parameters);
        });
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
            blink: z.string(),
        }),
    );

    switch (type) {
        case SchemeType.ActionUrl:
        case SchemeType.Interstitial: {
            const response = await fetchJSON<ActionGetResponse>(url, { method: 'GET', signal: request.signal });
            return createSuccessResponseJSON(createAction(url, response, blink));
        }
        case SchemeType.ActionsJson: {
            const u = new URL(url);
            const actionJson = await fetchJSON<ActionRuleResponse>(
                urlcat(u.origin, 'actions.json'),
                {
                    method: 'GET',
                },
                { noDefaultContentType: true },
            );
            const matchedApiUrl = resolveActionJson(url, actionJson) ?? url;
            const response = await fetchJSON<ActionGetResponse>(matchedApiUrl, {
                method: 'GET',
                signal: request.signal,
            });
            return createSuccessResponseJSON(createAction(matchedApiUrl, response, blink));
        }
        default:
            safeUnreachable(type);
            throw new UnreachableError('scheme type', type);
    }
});
