import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { settings } from '@/settings/index.js';
import type { Action, ActionComponent, ActionParameter, FireflyBlinkParserBlinkResponse } from '@/types/blink.js';

function createActionComponent(label: string, href: string, parameters?: ActionParameter[]): ActionComponent {
    return {
        label,
        href,
        parameters: parameters ?? [],
        parameter: parameters?.[0],
    };
}

function createAction(url: string, res: NonNullable<FireflyBlinkParserBlinkResponse['data']>) {
    const { actionApiUrl, action, state, actionUrl } = res;
    const PREFIX = 'solana://';
    const websiteUrl = actionUrl.startsWith(PREFIX) ? actionUrl.substring(PREFIX.length) : url;
    const actionResult: Action = {
        url,
        websiteUrl,
        icon: action.icon,
        title: action.title,
        description: action.description,
        disabled: action.disabled ?? false,
        actions: [],
        state,
    };
    if (action.links?.actions) {
        const u = parseURL(actionApiUrl);
        if (!u) return null;

        actionResult.actions = action.links.actions.map((action) => {
            const href = action.href.startsWith('https://') ? action.href : urlcat(u.origin, action.href);
            return createActionComponent(action.label, href, action.parameters);
        });
    } else {
        actionResult.actions = [createActionComponent(action.label, url)];
    }
    return actionResult;
}

class Loader extends BaseLoader<Action> {
    protected override fetch(url: string, signal?: AbortSignal): Promise<Action | null> {
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fireflySessionHolder.fetch<FireflyBlinkParserBlinkResponse>(
                urlcat(settings.FIREFLY_ROOT_URL, '/v1/solana/blinks/parse'),
                {
                    method: 'POST',
                    body: JSON.stringify({ url }),
                    signal: signal ? anySignal(timeout, signal) : timeout,
                },
            );

            if (!response.data || typeof response.data.action === 'string') return null;

            return createAction(url, response.data);
        });
    }

    public fetchAction(url: string) {
        return this.fetch(url);
    }
}

export const BlinkLoader = new Loader();
