import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { BaseLoader } from '@/libs/base/Loader.js';
import type { Action, ActionComponent, ActionsSpecGetResponse, Parameter } from '@/providers/solana-blink/type.js';

function createActionComponent(label: string, href: string, parameters?: [Parameter]): ActionComponent {
    return {
        parameterValue: '',
        label,
        href,
        parameters: [],
        parameter: parameters?.[0],
    };
}

class SolanaBlinks extends BaseLoader<Action> {
    protected override fetch(url: string, signal?: AbortSignal): Promise<Action | null> {
        return new Promise<Action | null>((resolve, reject) => {
            requestIdleCallback(async () => {
                try {
                    const timeout = AbortSignal.timeout(30_000);
                    const response = await fetchCachedJSON<ActionsSpecGetResponse>(url, {
                        signal: signal ? anySignal(timeout, signal) : timeout,
                    });
                    if (response.error) {
                        reject(new Error(response.error.message));
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
                        const urlObj = new URL(url);
                        actionResult.actions = data.links?.actions.map((action) => {
                            const href = action.href.startsWith('http') ? action.href : urlObj.origin + action.href;
                            return createActionComponent(action.label, href, action.parameters);
                        });
                    } else {
                        actionResult.actions = [createActionComponent(data.label, url)];
                    }
                    resolve(actionResult);
                } catch (error) {
                    console.error(`[solana blinks loader] fetch error: ${error}`);
                    reject(new Error('Failed to fetch solana blinks'));
                }
            });
        });
    }
}

export const SolanaBlinksLoader = new SolanaBlinks();
