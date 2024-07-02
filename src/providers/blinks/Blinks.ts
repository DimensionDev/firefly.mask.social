import { SOLANA_BLINKS_PREFIX } from '@/constants/regexp.js';
import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/libs/base/Loader.js';
import type { Action, ActionComponent, ActionsSpecGetResponse, Parameter } from '@/providers/blinks/type.js';

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
        url = url.startsWith(SOLANA_BLINKS_PREFIX) ? url.substring(SOLANA_BLINKS_PREFIX.length) : url;
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fetchCachedJSON<ActionsSpecGetResponse>(url, {
                signal: signal ? anySignal(timeout, signal) : timeout,
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
                const urlObj = parseURL(url)!;
                actionResult.actions = data.links?.actions.map((action) => {
                    const href = action.href.startsWith('http') ? action.href : urlObj.origin + action.href;
                    return createActionComponent(action.label, href, action.parameters);
                });
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

export const BlinksLoader = new Loader();
