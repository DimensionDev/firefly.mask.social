import type { EventId, Events } from '@/providers/types/Telemetry.js';

export interface Safary {
    track<T extends EventId>(event: {
        eventType: T;
        eventName: string;
        parameters: Events[T]['parameters'];
    }): Promise<void>;
}
