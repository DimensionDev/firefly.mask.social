import { v4 as uuid } from 'uuid';

import { NODE_ENV, STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';
import { bom } from '@/helpers/bom.js';
import { getPublicParameters } from '@/providers/safary/getPublicParameters.js';
import type { Events, Safary } from '@/providers/types/Safary.js';
import { Provider } from '@/providers/types/Telemetry.js';

function formatParameter(key: string, value: unknown): [string, unknown] {
    if (typeof value === 'boolean') {
        return [key, value === true ? 'Y' : 'N'];
    }
    return [key, value];
}

class SafaryTelemetry extends Provider<Events, never> {
    private latestEventId: string | null = null;

    private get sdk() {
        if (typeof bom.window?.safary === 'undefined') return null;
        return bom.window.safary as Safary;
    }

    override async captureEvent<T extends keyof Events>(
        name: T,
        parameters: Omit<Events[T]['parameters'], keyof ReturnType<typeof getPublicParameters>>,
    ): Promise<void> {
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
            const publicParameters = getPublicParameters(uuid(), this.latestEventId);
            const formattedParameters = Object.fromEntries(
                Object.entries(parameters).map(([key, value]) => formatParameter(key, value)),
            );

            // update the latest event id
            this.latestEventId = publicParameters.public_uuid;

            await this.sdk.track({
                eventType: name,
                eventName: name.replaceAll(/_/g, ' '),
                parameters: {
                    ...publicParameters,
                    ...formattedParameters,
                } as unknown as Events[T]['parameters'],
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
