import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';
import type { Events, Safary } from '@/providers/types/Safary.js';
import { Provider } from '@/providers/types/Telemetry.js';

function formatParameter(key: string, value: unknown): [string, unknown] {
    if (typeof value === 'boolean') {
        return [key, value === true ? 'Y' : 'N'];
    }
    return [key, value];
}

class SafaryTelemetry extends Provider<Events, never> {
    private get sdk() {
        if (typeof window.safary === 'undefined') return null;
        return window.safary as Safary;
    }

    override async captureEvent<T extends keyof Events>(name: T, parameters: Events[T]): Promise<void> {
        if (env.external.NEXT_PUBLIC_TELEMETRY === STATUS.Disabled) {
            return;
        }

        if (env.shared.NODE_ENV === NODE_ENV.Development) {
            console.info('[safary] capture event:', name, parameters);
            return;
        }

        if (!this.sdk) {
            console.error('[safary] safary SDK not available. failed to capture event:', name, parameters);
            return;
        }

        try {
            await this.sdk.track({
                eventType: name,
                eventName: name,
                parameters: Object.fromEntries(
                    Object.entries(parameters).map(([key, value]) => formatParameter(key, value)),
                ) as Events[T]['parameters'],
            });
        } catch (error) {
            console.error('[safary] failed to capture event:', name, parameters);
            throw error;
        }
    }

    override async captureException(): Promise<void> {
        throw new NotImplementedError();
    }
}

export const SafaryTelemetryProvider = new SafaryTelemetry();
