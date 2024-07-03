import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { ActionGetResponse } from '@/providers/types/Blink.js';
import type { Action, ActionComponent, ActionParameter } from '@/types/blink.js';
import type { ResponseJSON } from '@/types/index.js';

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
            const response = await fetchCachedJSON<ResponseJSON<ActionGetResponse>>(
                urlcat('/solana/action', {
                    url,
                }),
                {
                    signal: signal ? anySignal(timeout, signal) : timeout,
                    method: 'GET',
                },
            );
            if (!response.success) throw new Error(response.error.message);
            const data = response.data;
            const actionResult: Action = {
                url,
                websiteUrl: url,
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
        });
    }

    public fetchAction(url: string) {
        return this.fetch(url);
    }
}

export const BlinkLoader = new Loader();
