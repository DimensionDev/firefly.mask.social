import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { ActionGetResponse } from '@/providers/types/Blink.js';
import type { Response } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import type { Action, ActionComponent, ActionParameter, ActionType } from '@/types/blink.js';

export type BlinkResponse = Response<{
    action: ActionGetResponse;
    actionApiUrl: string;
    actionUrl: string;
    state: ActionType;
} | null>;

function createActionComponent(label: string, href: string, parameters?: ActionParameter[]): ActionComponent {
    return {
        label,
        href,
        parameters: parameters ?? [],
        parameter: parameters?.[0],
    };
}

function createAction(url: string, data: ActionGetResponse, blink: string, state: ActionType) {
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
        state,
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

class Loader extends BaseLoader<Action> {
    protected override fetch(url: string, signal?: AbortSignal): Promise<Action | null> {
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fireflySessionHolder.fetch<BlinkResponse>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v1/solana/blinks/parse'),
                {
                    method: 'POST',
                    body: JSON.stringify({ url }),
                    signal: signal ? anySignal(timeout, signal) : timeout,
                },
            );

            if (!response.data) return null;

            return createAction(url, response.data.action, response.data.actionUrl, response.data.state);
        });
    }

    public fetchAction(url: string) {
        return this.fetch(url);
    }
}

export const BlinkLoader = new Loader();
