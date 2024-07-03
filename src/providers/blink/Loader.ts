import urlcat from 'urlcat';

import { SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON, fetchJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { ActionGetResponse, ActionRuleResponse } from '@/providers/types/Blink.js';
import type { Action, ActionComponent, ActionParameter } from '@/types/blink.js';

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

function createActionComponent(label: string, href: string, parameters?: [ActionParameter]): ActionComponent {
    return {
        parameterValue: '',
        label,
        href,
        parameters: [],
        parameter: parameters?.[0],
    };
}

class Loader extends BaseLoader<Action> {
    protected override fetch(url: string, signal?: AbortSignal): Promise<Action | null> {
        const actionOriginalURL = url.startsWith(SOLANA_BLINK_PREFIX) ? url.substring(SOLANA_BLINK_PREFIX.length) : url;
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            if (url.startsWith(SOLANA_BLINK_PREFIX)) {
                url = url.substring(SOLANA_BLINK_PREFIX.length);
                const urlObj = parseURL(url);
                if (!urlObj) throw new Error('Invalid blink');
                const actionJsonUrl = urlcat(urlObj.origin, 'actions.json');
                const actionJson = await fetchJSON<ActionRuleResponse>(
                    actionJsonUrl,
                    {
                        method: 'GET',
                        signal: signal ? anySignal(timeout, signal) : timeout,
                    },
                    { noDefaultContentType: true },
                );
                url = resolveActionJson(url, actionJson) ?? url;
            }
            const response = await fetchCachedJSON<ActionGetResponse>(url, {
                signal: signal ? anySignal(timeout, signal) : timeout,
                method: 'GET',
            });
            if (response.error) {
                throw new Error(response.error.message);
            }
            const actionResult: Action = {
                url,
                websiteUrl: actionOriginalURL,
                icon: response.icon,
                title: response.title,
                description: response.description,
                disabled: response.disabled ?? false,
                actions: [],
            };
            if (response.links?.actions) {
                const u = parseURL(url);
                if (u) {
                    actionResult.actions = response.links.actions.map((action) => {
                        const href = action.href.startsWith('http') ? action.href : u.origin + action.href;
                        return createActionComponent(action.label, href, action.parameters);
                    });
                }
            } else {
                actionResult.actions = [createActionComponent(response.label, url)];
            }
            return actionResult;
        });
    }

    public fetchAction(url: string) {
        return this.fetch(url);
    }
}

export const BlinkLoader = new Loader();
