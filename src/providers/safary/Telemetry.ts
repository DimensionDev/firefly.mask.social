import { NotImplementedError } from '@/constants/error.js';
import type { Events, Safary } from '@/providers/types/Safary.js';
import { Provider } from '@/providers/types/Telemetry.js';

class SafaryTelemetry extends Provider<Events, never> {
    private get sdk() {
        if (typeof window.safary === 'undefined') return null;
        return window.safary as Safary;
    }

    override captureEvent<T extends keyof Events>(name: T, parameters: Events[T]): void {
        throw new Error('Method not implemented.');
    }

    override captureException(): void {
        throw new NotImplementedError();
    }
}

export const SafaryTelemetryProvider = new SafaryTelemetry();
