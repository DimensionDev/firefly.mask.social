import { safeUnreachable } from '@masknet/kit';

import { UnreachableError } from '@/constants/error.js';
import { runInSafe } from '@/helpers/runInSafe.js';
import { getComposeEventParameters, type Options } from '@/providers/safary/getComposeEventParameters.js';
import { getPostEventId, getPostEventParameters } from '@/providers/safary/getPostEventParameters.js';
import { SafaryTelemetryProvider } from '@/providers/safary/Telemetry.js';
import { EventId } from '@/providers/types/Telemetry.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export function captureComposeEvent(type: ComposeType, post: CompositePost, options: Options = {}) {
    const capture = () => {
        const date = new Date();
        const size = post.availableSources.length;
        const { draftId, scheduleId } = options;

        // draft created
        if (draftId) {
            SafaryTelemetryProvider.captureEvent(EventId.COMPOSE_DRAFT_CREATE_SUCCESS, {
                draft_id: draftId,
                draft_time: date.getTime(),
                draft_time_utc: date.toUTCString(),
                ...getComposeEventParameters(post, options),
            });
        }

        // scheduled post created
        if (scheduleId) {
            SafaryTelemetryProvider.captureEvent(EventId.COMPOSE_SCHEDULED_POST_CREATE_SUCCESS, {
                schedule_id: scheduleId,
                schedule_time: date.getTime(),
                scheduled_time_utc: date.toUTCString(),
                ...getComposeEventParameters(post, options),
            });
        }

        // post created
        {
            // post to only one platform
            if (size === 1) {
                switch (type) {
                    case 'compose':
                        SafaryTelemetryProvider.captureEvent(
                            getPostEventId(type, post),
                            getComposeEventParameters(post, options),
                        );
                        break;
                    case 'reply':
                    case 'quote':
                        const source = post.availableSources[0];

                        const profile = post.parentPost[source]?.author;
                        if (!profile) throw new Error(`Target profile is missing, source = ${source}.`);

                        const postId = post.parentPost[source]?.postId;
                        if (!postId) throw new Error(`Target post ID is missing, source = ${source}.`);

                        SafaryTelemetryProvider.captureEvent(
                            getPostEventId(type, post),
                            getPostEventParameters(postId, profile),
                        );
                        break;
                    default:
                        safeUnreachable(type);
                        throw new UnreachableError('type', type);
                }

                // crossed post
            } else if (size > 1) {
                SafaryTelemetryProvider.captureEvent(
                    EventId.COMPOSE_CROSS_POST_SEND_SUCCESS,
                    getComposeEventParameters(post, options),
                );
            }
        }
    };

    runInSafe(capture);
}
