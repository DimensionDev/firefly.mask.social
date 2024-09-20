import { safeUnreachable } from '@masknet/kit';

import { UnreachableError } from '@/constants/error.js';
import { getComposeEventParameters, type Options } from '@/providers/safary/getComposeEventParameters.js';
import { getPostEventId, getPostEventParameters } from '@/providers/safary/getPostEventParameters.js';
import { SafaryTelemetryProvider } from '@/providers/safary/Telemetry.js';
import { EventId } from '@/providers/types/Telemetry.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export function captureComposeEvent(type: ComposeType, post: CompositePost, options?: Options) {
    const size = post.availableSources.length;

    // post shared to only one platform
    if (size === 1) {
        switch (type) {
            case 'compose':
                SafaryTelemetryProvider.captureEvent(getPostEventId(type, post), getComposeEventParameters(post));
                break;
            case 'reply':
                SafaryTelemetryProvider.captureEvent(getPostEventId(type, post), getPostEventParameters(post));
                break;
            case 'quote':
                SafaryTelemetryProvider.captureEvent(getPostEventId(type, post), getPostEventParameters(post));
                break;
            default:
                safeUnreachable(type);
                throw new UnreachableError('type', type);
        }

    // crossed post
    } else if (size > 1) {
        SafaryTelemetryProvider.captureEvent(EventId.COMPOSE_CROSS_POST_SEND_SUCCESS, getComposeEventParameters(post));
    }
}
