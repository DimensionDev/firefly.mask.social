import urlcat from 'urlcat';

import { SOLANA_BLINK_PREFIX } from '@/constants/regexp.js';
import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON, fetchJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { resolveActionJson } from '@/helpers/resolveActionJson.js';
import { BaseLoader } from '@/libs/base/Loader.js';
import type {
    Action,
    ActionComponent,
    ActionRuleResponse,
    ActionsSpecGetResponse,
    Parameter,
} from '@/providers/types/Blink.js';

function createActionComponent(label: string, href: string, parameters?: [Parameter]): ActionComponent {
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
            const response = await fetchCachedJSON<ActionsSpecGetResponse>(url, {
                signal: signal ? anySignal(timeout, signal) : timeout,
                method: 'GET',
            });
            if (response.error) {
                throw new Error(response.error.message);
            }
            const data = response;
            const actionResult: Action = {
                url,
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
