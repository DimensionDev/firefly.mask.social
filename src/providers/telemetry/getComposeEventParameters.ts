import { compact } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { getRpMetadata } from '@/mask/plugins/red-packet/helpers/rpPayload.js';
import type { ComposeEventParameters } from '@/providers/types/Telemetry.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export interface Options {
    draftId?: string;
    scheduleId?: string;
    thread?: CompositePost[];
}

export function getComposeEventParameters(
    post: CompositePost,
    { draftId, scheduleId, thread = [post] }: Options = {},
): Omit<ComposeEventParameters, 'firefly_account_id'> {
    const lensProfile = useLensStateStore.getState().currentProfile;
    const farcasterProfile = useFarcasterStateStore.getState().currentProfile;
    const xProfile = useTwitterStateStore.getState().currentProfile;

    // schedule time indicates that the post is scheduled
    // but only schedule id indicates that the post is scheduled and saved
    const scheduleTime = useComposeScheduleStateStore.getState().scheduleTime;

    const rp = post.typedMessage?.meta ? getRpMetadata(post.typedMessage) : null;

    return {
        include_lens_post: post.availableSources.includes(Source.Lens),
        lens_id: lensProfile?.profileId,
        lens_handle: lensProfile?.handle,
        lens_post_ids: compact(thread?.map((p) => p.postId[Source.Lens] ?? undefined)),

        include_farcaster_cast: post.availableSources.includes(Source.Farcaster),
        farcaster_id: farcasterProfile?.profileId,
        farcaster_handle: farcasterProfile?.handle,
        farcaster_cast_ids: compact(thread?.map((p) => p.postId[Source.Farcaster] ?? undefined)),

        include_x_post: post.availableSources.includes(Source.Twitter),
        x_id: xProfile?.profileId,
        x_handle: xProfile?.handle,
        x_post_ids: compact(thread?.map((p) => p.postId[Source.Twitter] ?? undefined)),

        is_thread: !!thread?.length && thread.length > 1,

        is_draft: !!draftId,
        draft_id: draftId,

        is_scheduled: !!scheduleId || !!scheduleTime,
        schedule_id: scheduleId,

        include_lucky_drop: !!post.rpPayload,
        lucky_drop_ids: rp?.rpid ? [rp.rpid] : [],

        include_poll: !!(post.poll && Object.values(post.poll?.pollIds).some((id) => !!id)),
        poll_id:
            post.poll?.pollIds[Source.Lens] ??
            post.poll?.pollIds[Source.Farcaster] ??
            post.poll?.pollIds[Source.Twitter] ??
            undefined,

        include_farcaster_poll: !!post.poll?.pollIds[Source.Farcaster],
        farcaster_poll_id: post.poll?.pollIds[Source.Farcaster] ?? undefined,

        include_lens_poll: !!post.poll?.pollIds[Source.Lens],
        lens_poll_id: post.poll?.pollIds[Source.Lens] ?? undefined,

        include_x_poll: !!post.poll?.pollIds[Source.Twitter],
        x_poll_id: post.poll?.pollIds[Source.Twitter] ?? undefined,

        include_image: post.images.length > 0,
        include_video: !!post.video,
    };
}
