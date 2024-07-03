import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON, fetchJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { ActionGetResponse, ActionRuleResponse } from '@/providers/types/Blink.js';
import type { Action, ActionComponent, ActionParameter } from '@/types/blink.js';
import urlcat from 'urlcat';

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
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fetchCachedJSON<ActionGetResponse>(url, {
                signal: signal ? anySignal(timeout, signal) : timeout,
                method: 'GET',
            });
            if (response.error) throw new Error(response.error.message);

            const action: Action = {
                url,
                websiteUrl: url,
                icon: response.icon,
                title: response.title,
                description: response.description,
                disabled: response.disabled ?? false,
                actions: [],
            };
            if (response.links?.actions?.length) {
                const u = parseURL(url);
                if (u) {
                    action.actions = response.links.actions.map((action) => {
                        const href = action.href.startsWith('https') ? action.href : urlcat(u.origin, u.href);
                        return createActionComponent(action.label, href, action.parameters);
                    });
                }
            } else {
                action.actions = [createActionComponent(response.label, url)];
            }
            return action;
        });
    }

    public fetchAction(url: string) {
        return this.fetch(url);
    }
}

export const BlinkLoader = new Loader();
