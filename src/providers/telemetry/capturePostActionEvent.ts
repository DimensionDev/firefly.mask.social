import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getPostEventParameters } from '@/providers/telemetry/getPostEventParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { EventId } from '@/providers/types/Telemetry.js';

type PostActionType =
    | 'like'
    | 'unlike'
    | 'reply'
    | 'quote'
    | 'delete'
    | 'share'
    | 'repost'
    | 'undo_repost'
    | 'bookmark'
    | 'unbookmark';

const resolvePostActionEventIds = createLookupTableResolver<SocialSource, Record<PostActionType, EventId>>(
    {
        [Source.Farcaster]: {
            like: EventId.FARCASTER_POST_LIKE_SUCCESS,
            unlike: EventId.FARCASTER_POST_UNLIKE_SUCCESS,
            reply: EventId.FARCASTER_POST_REPLY_SUCCESS,
            quote: EventId.FARCASTER_POST_QUOTE_SUCCESS,
            delete: EventId.FARCASTER_POST_DELETE_SUCCESS,
            share: EventId.FARCASTER_POST_SHARE_SUCCESS,
            repost: EventId.FARCASTER_POST_REPOST_SUCCESS,
            undo_repost: EventId.FARCASTER_POST_UNDO_REPOST_SUCCESS,
            bookmark: EventId.FARCASTER_POST_BOOKMARK_SUCCESS,
            unbookmark: EventId.FARCASTER_POST_UNBOOKMARK_SUCCESS,
        },
        [Source.Lens]: {
            like: EventId.LENS_POST_LIKE_SUCCESS,
            unlike: EventId.LENS_POST_UNLIKE_SUCCESS,
            reply: EventId.LENS_POST_REPLY_SUCCESS,
            quote: EventId.LENS_POST_QUOTE_SUCCESS,
            delete: EventId.LENS_POST_DELETE_SUCCESS,
            share: EventId.LENS_POST_SHARE_SUCCESS,
            repost: EventId.LENS_POST_REPOST_SUCCESS,
            undo_repost: EventId.LENS_POST_UNDO_REPOST_SUCCESS,
            bookmark: EventId.LENS_POST_BOOKMARK_SUCCESS,
            unbookmark: EventId.LENS_POST_UNBOOKMARK_SUCCESS,
        },
        [Source.Twitter]: {
            like: EventId.X_POST_LIKE_SUCCESS,
            unlike: EventId.X_POST_UNLIKE_SUCCESS,
            reply: EventId.X_POST_REPLY_SUCCESS,
            quote: EventId.X_POST_QUOTE_SUCCESS,
            delete: EventId.X_POST_DELETE_SUCCESS,
            share: EventId.X_POST_SHARE_SUCCESS,
            repost: EventId.X_POST_REPOST_SUCCESS,
            undo_repost: EventId.X_POST_UNDO_REPOST_SUCCESS,
            bookmark: EventId.X_POST_BOOKMARK_SUCCESS,
            unbookmark: EventId.X_POST_UNBOOKMARK_SUCCESS,
        },
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export function capturePostActionEvent(action: PostActionType, post: Post) {
    return runInSafeAsync(() => {
        const eventIds = resolvePostActionEventIds(post.source);
        const eventId = eventIds[action];

        return TelemetryProvider.captureEvent(eventId, getPostEventParameters(post.postId, post.author));
    });
}
