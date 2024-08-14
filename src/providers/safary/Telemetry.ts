import { Provider, type EventOptions, type ExceptionOptions } from '@/providers/types/Telemetry.js';

class SafaryTelemetry extends Provider {
    override captureEvent(options: EventOptions): void {
        throw new Error('Method not implemented.');
    }
    override captureException(options: ExceptionOptions): void {
        throw new Error('Method not implemented.');
    }
}

export const SafaryTelemetryProvider = new SafaryTelemetry();
