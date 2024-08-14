import type { Safary } from '@/providers/types/Safary.js';
import { type EventOptions, type ExceptionOptions, Provider } from '@/providers/types/Telemetry.js';

class SafaryTelemetry extends Provider {
    private get sdk() {
        if (typeof window.safary === 'undefined') return null;
        return window.safary as Safary;
    }

    override captureEvent(options: EventOptions): void {
        if (!this.shouldRecord()) return;
        throw new Error('Method not implemented.');
    }

    override captureException(options: ExceptionOptions): void {
        if (!this.shouldRecord()) return;
        throw new Error('Method not implemented.');
    }
}

export const SafaryTelemetryProvider = new SafaryTelemetry();
