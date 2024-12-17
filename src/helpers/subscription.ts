import { noop } from 'lodash-es';
import type { Subscription } from 'use-subscription';

import type { ValueRef } from '@/libs/ValueRef.js';

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
