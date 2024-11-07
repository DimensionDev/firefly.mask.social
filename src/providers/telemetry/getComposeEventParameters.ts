import { compact } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import { getRpMetadata } from '@/helpers/rpPayload.js';
import type { ComposeEventParameters } from '@/providers/types/Telemetry.js';
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

        is_scheduled: !!scheduleId,
        schedule_id: scheduleId,

        include_lucky_drop: !!post.rpPayload,
        lucky_drop_ids: rp?.rpid ? [rp.rpid] : [],

        include_farcaster_poll: !!post.poll?.pollIds?.Farcaster,
        farcaster_poll_id: post.poll?.pollIds?.Farcaster,
        include_lens_poll: !!post.poll?.pollIds?.Lens,
        lens_poll_id: post.poll?.pollIds?.Lens,
        include_x_poll: !!post.poll?.pollIds?.Twitter,
        x_poll_id: post.poll?.pollIds?.Twitter,

        include_image: post.images.length > 0,
        include_video: !!post.video,
    };
}
