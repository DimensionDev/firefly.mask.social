import { timeout } from '@masknet/kit';
import { uniqueId } from 'lodash-es';

import { type RequestArguments, type RequestResult, SupportedMethod } from '@/types/bridge.js';

function getFireflyAPI() {
    return Reflect.get(window, 'FireflyApi') as
        | (<T extends SupportedMethod>(method: T, id: string, params: RequestArguments[T]) => Promise<RequestResult[T]>)
        | undefined;
}

class FireflyBridgeProvider {
    private callbacks = new Map();

    private installCallbacks() {
        Reflect.set(
            window,
            'callJsMethod',
            <T extends SupportedMethod>(
                method: T,
                id: string,
                response: {
                    result?: RequestResult[T];
                    error?: string;
                },
            ) => {
                this.callbacks.get(id)?.(response);
            },
        );
    }

    request<T extends SupportedMethod>(method: T, params?: RequestArguments[T]) {
        const requestId = uniqueId('bridge');

        return timeout(
            new Promise<RequestResult[T]>((resolve, reject) => {
                this.callbacks.set(requestId, ({ result, error }: { result?: RequestResult[T]; error?: string }) => {
                    if (error) reject(error);
                    else resolve(result as RequestResult[T]);
                });
                this.installCallbacks();

                // dispatch the request to the native app
                getFireflyAPI()?.(method, requestId, params as RequestArguments[T]);
            }),
            3 * 60 * 1000 /* 3 minute */,
        ).finally(() => {
            this.callbacks.delete(requestId);
        });
    }
}

export const fireflyBridgeProvider = new FireflyBridgeProvider();
