import { sendGAEvent } from '@next/third-parties/google';
import { v4 as uuid } from 'uuid';

import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { NotImplementedError } from '@/constants/error.js';
import { bom } from '@/helpers/bom.js';
import { getPublicParameters } from '@/providers/telemetry/getPublicParameters.js';
import type { Safary } from '@/providers/types/Safary.js';
import { type Events, EventType, Provider, ProviderFilter, VersionFilter } from '@/providers/types/Telemetry.js';
import { useDeveloperSettingsState } from '@/store/useDeveloperSettingsStore.js';

function formatParameter(key: string, value: unknown): [string, unknown] {
    if (typeof value === 'boolean') {
        return [key, value === true ? 'Y' : 'N'];
    }
    return [key, value];
}

class Telemetry extends Provider<Events, never> {
    private latestEventId: string | null = null;

    private get safary() {
        if (typeof bom.window?.safary === 'undefined') return null;
        return bom.window.safary as Safary;
    }

    override async captureEvent<T extends keyof Events>(
        name: T,
        parameters: Omit<Events[T]['parameters'], keyof ReturnType<typeof getPublicParameters>>,
        {
            version_filter = VersionFilter.Latest,
            provider_filter = ProviderFilter.All,
        }: { version_filter?: VersionFilter; provider_filter?: ProviderFilter } = {},
    ): Promise<void> {
        if (env.external.NEXT_PUBLIC_TELEMETRY === STATUS.Disabled) {
            console.log('[telemetry] event capture is disabled');
            return;
        }

        if (version_filter === VersionFilter.Next) {
            console.error('[telemetry] event is filtered out:', name, parameters);
            return;
        }

        if (!useDeveloperSettingsState.getState().logTelemetry) {
            console.info('[telemetry] capture event:', name, parameters);
            return;
        }

        const publicParameters = getPublicParameters(uuid(), this.latestEventId);
        const formattedParameters = Object.fromEntries(
            Object.entries(parameters).map(([key, value]) => formatParameter(key, value)),
        );

        // update the latest event id
        this.latestEventId = publicParameters.public_uuid;

        const event = {
            eventType: name,
            eventName: name.replaceAll(/_/g, ' '),
            parameters: {
                ...publicParameters,
                ...formattedParameters,
            } as unknown as Events[T]['parameters'],
        };

        if (provider_filter === ProviderFilter.All || provider_filter === ProviderFilter.GA) {
            try {
                sendGAEvent('event', event.eventType, {
                    ...event.parameters,
                    debug_mode:
                        env.external.NEXT_PUBLIC_TELEMETRY_DEBUG === STATUS.Enabled ||
                        event.eventName === EventType.Debug,
                });
            } catch (error) {
                console.error('[ga] failed to capture event:', event);
            }
        } else {
            console.info('[ga] event is filtered out:', name, parameters);
        }

        if (provider_filter === ProviderFilter.All || provider_filter === ProviderFilter.Safary) {
            try {
                if (this.safary) {
                    await this.safary.track(event);
                } else {
                    console.error('[safary] safary SDK not available. failed to capture event:', name, parameters);
                }
            } catch (error) {
                console.error('[safary] failed to capture event:', event);
            }
        } else {
            console.info('[safary] event is filtered out:', name, parameters);
        }
    }

    override async captureException(): Promise<void> {
        throw new NotImplementedError();
    }
}

export const TelemetryProvider = new Telemetry();
