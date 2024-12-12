import { noop } from 'lodash-es';

import type { ValueRef } from '@/libs/ValueRef.js';

export type Unsubscribe = () => void;

export interface Subscription<T> {
    /**
     * (Synchronously) returns the current value of our subscription.
     */
    getCurrentValue: () => T;
    /**
     * This function is passed an event handler to attach to the subscription.
     * It must return an unsubscribe function that removes the handler.
     */
    subscribe: (callback: () => void) => Unsubscribe;
}

export function createConstantSubscription<T>(value: T): Subscription<T> {
    return {
        getCurrentValue: () => value,
        subscribe: () => noop,
    };
}

export function createSubscriptionFromValueRef<T>(ref: ValueRef<T>, signal?: AbortSignal): Subscription<T> {
    return SubscriptionDebug({
        getCurrentValue: () => ref.value,
        subscribe: (sub) => {
            if (signal?.aborted) return noop;
            const f = ref.addListener(sub);
            signal?.addEventListener('abort', f, { once: true });
            return f;
        },
    });
}

export function SubscriptionDebug<T>(x: Subscription<T>): Subscription<T> {
    Object.defineProperty(x, '_value', {
        configurable: true,
        get: () => x.getCurrentValue(),
    });
    return x;
}
