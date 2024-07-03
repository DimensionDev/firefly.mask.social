import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { ActionGetResponse } from '@/providers/types/Blink.js';
import type { Action, ActionComponent, ActionParameter, ActionScheme } from '@/types/blink.js';

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
                // should be replaced by blink url in privilege methods
                websiteUrl: url,
                icon: response.icon,
                title: response.title,
                description: response.description,
                disabled: response.disabled ?? false,
                actions: [],
            };
            if (response.links?.actions?.length) {
                const u = parseURL(url);
                if (!u) throw new Error('Invalid URL');

                action.actions = response.links.actions.map((action) => {
                    const href = action.href.startsWith('https') ? action.href : urlcat(u.origin, u.href);
                    return createActionComponent(action.label, href, action.parameters);
                });
            } else {
                action.actions = [createActionComponent(response.label, url)];
            }
            return action;
        });
    }

    public async fetchAction({ url, blink }: ActionScheme): Promise<Action | null> {
        const action = await this.fetch(url);
        if (!action) return null;

        return {
            ...action,
            websiteUrl: blink,
        };
    }
}

export const BlinkLoader = new Loader();
