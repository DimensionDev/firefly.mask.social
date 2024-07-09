import { noop } from 'lodash-es';
import type { Subscription } from 'use-subscription';

export function createConstantSubscription<T>(value: T): Subscription<T> {
    return {
        getCurrentValue: () => value,
        subscribe: () => noop,
    };
}
