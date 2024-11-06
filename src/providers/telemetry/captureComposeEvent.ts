import { safeUnreachable } from '@masknet/kit';
import dayjs from 'dayjs';

import { UnreachableError } from '@/constants/error.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getComposeEventParameters, type Options } from '@/providers/telemetry/getComposeEventParameters.js';
import { getPostEventId, getPostEventParameters } from '@/providers/telemetry/getPostEventParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

function getTimeParameters(date = new Date()) {
    const offset = new Date().getTimezoneOffset();
    return `${dayjs(date).format('mm-dd-yyyy HH:mm:ss')}(GMT${offset < 0 ? '+' : '-'}${Math.abs(offset / 60)})`;
}

export function captureComposeDraftPostEvent(
    eventId: EventId.COMPOSE_DRAFT_CREATE_SUCCESS,
    post: CompositePost,
    options: Options = {},
) {
    return runInSafeAsync(async () => {
        const date = new Date();

        const draftId = options.draftId;
        if (!draftId) throw new Error('Draft ID is missing.');

        return TelemetryProvider.captureEvent(eventId, {
            draft_id: draftId,
            draft_time: date.getTime(),
            draft_time_utc: getTimeParameters(date),
            ...getComposeEventParameters(post, {
                draftId,
                thread: options.thread,
            }),
        });
    });
}

export function captureComposeSchedulePostEvent(
    eventId:
        | EventId.COMPOSE_SCHEDULED_POST_CREATE_SUCCESS
        | EventId.COMPOSE_SCHEDULED_POST_DELETE_SUCCESS
        | EventId.COMPOSE_SCHEDULED_POST_UPDATE_SUCCESS,
    post: CompositePost | null,
    options: Options = {},
) {
    return runInSafeAsync(async () => {
        const date = new Date();

        const scheduleId = options.scheduleId;
        if (!scheduleId) throw new Error('Schedule ID is missing.');

        switch (eventId) {
            case EventId.COMPOSE_SCHEDULED_POST_DELETE_SUCCESS:
                return TelemetryProvider.captureEvent(eventId, {
                    schedule_id: scheduleId,
                    schedule_time: date.getTime(),
                    scheduled_time_utc: getTimeParameters(date),
                });
            case EventId.COMPOSE_SCHEDULED_POST_UPDATE_SUCCESS:
                return TelemetryProvider.captureEvent(eventId, {
                    schedule_id: scheduleId,
                    new_schedule_time: date.getTime(),
                    new_scheduled_time_utc: getTimeParameters(date),
                });
            case EventId.COMPOSE_SCHEDULED_POST_CREATE_SUCCESS:
                if (!post) throw new Error('Post is missing.');
                return TelemetryProvider.captureEvent(eventId, {
                    schedule_id: scheduleId,
                    schedule_time: date.getTime(),
                    scheduled_time_utc: getTimeParameters(date),
                    ...getComposeEventParameters(post, {
                        scheduleId,
                    }),
                });
            default:
                safeUnreachable(eventId);
                throw new UnreachableError('eventId', eventId);
        }
    });
}

export function captureComposeEvent(type: ComposeType, post: CompositePost, options: Options = {}) {
    const capture = () => {
        const size = post.availableSources.length;

        // post created
        {
            // post to only one platform
            if (size === 1) {
                switch (type) {
                    case 'compose':
                        return TelemetryProvider.captureEvent(
                            getPostEventId(type, post),
                            getComposeEventParameters(post, options),
                        );
                    case 'reply':
                    case 'quote':
                        const source = post.availableSources[0];
                        const parentPost = post.parentPost[source];

                        const profile = parentPost?.author;
                        if (!profile) throw new Error(`Target profile is missing, source = ${source}.`);

                        const postId = parentPost?.postId;
                        if (!postId) throw new Error(`Target post ID is missing, source = ${source}.`);

                        return TelemetryProvider.captureEvent(
                            getPostEventId(type, post),
                            getPostEventParameters(parentPost),
                        );
                    default:
                        safeUnreachable(type);
                        throw new UnreachableError('type', type);
                }

                // crossed post
            } else if (size > 1) {
                return TelemetryProvider.captureEvent(
                    EventId.COMPOSE_CROSS_POST_SEND_SUCCESS,
                    getComposeEventParameters(post, options),
                );
            }

            throw new Error('Invalid post size.');
        }
    };

    return runInSafeAsync(capture);
}
