import { compact } from 'lodash-es';

import { Source } from '@/constants/enum.js';
import type { ComposeEventParameters } from '@/providers/types/Telemetry.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function getComposeEventParameters(
    post: CompositePost,
    thread?: CompositePost[],
): Omit<ComposeEventParameters, 'firefly_account_id'> {
    return {
        include_lens_post: post.availableSources.includes(Source.Lens),
        lens_id: post.parentPost[Source.Lens]?.author.profileId ?? undefined,
        lens_handle: post.parentPost[Source.Lens]?.author.handle ?? undefined,
        lens_post_ids: compact(thread?.map((p) => p.postId[Source.Lens] ?? undefined)),

        include_farcaster_cast: post.availableSources.includes(Source.Farcaster),
        farcaster_id: post.parentPost[Source.Farcaster]?.author.profileId ?? undefined,
        farcaster_handle: post.parentPost[Source.Farcaster]?.author.handle ?? undefined,
        farcaster_cast_ids: compact(thread?.map((p) => p.postId[Source.Farcaster] ?? undefined)),

        include_x_post: post.availableSources.includes(Source.Twitter),
        x_id: post.parentPost[Source.Twitter]?.author.profileId ?? undefined,
        x_handle: post.parentPost[Source.Twitter]?.author.handle ?? undefined,
        x_post_ids: compact(thread?.map((p) => p.postId[Source.Twitter] ?? undefined)),

        is_thread: !!thread?.length && thread.length > 1,

        is_scheduled: false,
        schedule_id: undefined,

        include_lucky_drop: !!post.rpPayload,
        lucky_drop_ids: undefined,

        include_poll: !!post.poll,
        poll_id: post.poll?.id,

        include_image: post.images.length > 0,
        include_video: !!post.video,
    };
}
