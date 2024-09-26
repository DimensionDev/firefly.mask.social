import { timeout } from '@masknet/kit';
import { uniqueId } from 'lodash-es';

import { parseJSON } from '@/helpers/parseJSON.js';
import { type RequestArguments, type RequestResult, SupportedMethod } from '@/types/bridge.js';

const NO_RETURN_METHODS = [SupportedMethod.SHARE, SupportedMethod.COMPOSE, SupportedMethod.BACK];

function getFireflyAPI() {
    const api = Reflect.get(window, 'FireflyApi') as
        | {
              callNativeMethod: <T extends SupportedMethod>(method: T, id: string, params: RequestArguments[T]) => void;
          }
        | undefined;
    if (!api) throw new Error('Firefly API is not available');
    return api;
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

    request<T extends SupportedMethod>(method: T, params: RequestArguments[T]) {
        const requestId = uniqueId('bridge');

        if (NO_RETURN_METHODS.includes(method)) {
            getFireflyAPI().callNativeMethod(method, requestId, params as RequestArguments[T]);
            return Promise.resolve() as unknown as RequestResult[T];
        }

        return timeout(
            new Promise<RequestResult[T]>((resolve, reject) => {
                this.callbacks.set(requestId, (response: string) => {
                    const parsed = parseJSON<{ result?: RequestResult[T]; error?: string }>(response);
                    if (!parsed) throw new Error(`Failed to parse response: ${response}`);

                    const { error, result } = parsed;
                    if (error) reject(error);
                    else resolve(result as RequestResult[T]);
                });
                this.installCallbacks();

                // dispatch the request to the native app
                getFireflyAPI().callNativeMethod(method, requestId, params as RequestArguments[T]);
            }),
            3 * 60 * 1000 /* 3 minute */,
        ).finally(() => {
            this.callbacks.delete(requestId);
        });
    }
}

export const fireflyBridgeProvider = new FireflyBridgeProvider();
