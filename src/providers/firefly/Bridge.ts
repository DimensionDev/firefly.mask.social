import { timeout } from '@masknet/kit';
import { uniqueId } from 'lodash-es';

import { parseJSON } from '@/helpers/parseJSON.js';
import { type RequestArguments, type RequestResult, SupportedMethod } from '@/types/bridge.js';

const NO_RETURN_METHODS = [
    SupportedMethod.SHARE,
    SupportedMethod.COMPOSE,
    SupportedMethod.BACK,
    SupportedMethod.UPDATE_NAVIGATOR_BAR,
];

function callNativeMethod<T extends SupportedMethod>(method: T, id: string, params: RequestArguments[T]) {
    // android
    if (window.FireflyApi) {
        window.FireflyApi.callNativeMethod(method, id, JSON.stringify(params));
        return;
    }

    // ios
    if (window.webkit?.messageHandlers?.callNativeMethod) {
        window.webkit.messageHandlers.callNativeMethod.postMessage({
            method,
            tag: id,
            params: JSON.stringify(params),
        });
        return;
    }

    throw new Error(`Failed to call native method: ${method} ${JSON.stringify(params)}`);
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

    /**
     * Return true if the application is opened in a native environment.
     */
    get supported() {
        if (typeof window.FireflyApi?.callNativeMethod === 'function') return true;
        if (typeof window.webkit?.messageHandlers?.callNativeMethod?.postMessage === 'function') return true;
        return false;
    }

    /**
     * Send a request to the native app.
     * @param method
     * @param params
     * @returns
     */
    request<T extends SupportedMethod>(method: T, params: RequestArguments[T]) {
        const requestId = uniqueId('bridge');

        if (NO_RETURN_METHODS.includes(method)) {
            callNativeMethod(method, requestId, params as RequestArguments[T]);
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
                callNativeMethod(method, requestId, params as RequestArguments[T]);
            }),
            3 * 60 * 1000 /* 3 minute */,
            `request ${method} timeout.`,
        ).finally(() => {
            this.callbacks.delete(requestId);
        });
    }
}

export const fireflyBridgeProvider = new FireflyBridgeProvider();
