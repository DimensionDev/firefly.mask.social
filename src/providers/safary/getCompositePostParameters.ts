import { Source } from '@/constants/enum.js';
import type { CompositePost } from '@/store/useComposeStore.js';

export function getCompositePostParameters(post: CompositePost) {
    return {
        include_lens_post: post.availableSources.includes(Source.Lens),
        lens_post_id: post.postId[Source.Lens] ?? undefined,
        lens_id: post.parentPost[Source.Lens]?.author.profileId ?? undefined,
        lens_handle: post.parentPost[Source.Lens]?.author.handle ?? undefined,
        include_farcaster_cast: post.availableSources.includes(Source.Farcaster),
        farcaster_cast_id: post.postId[Source.Farcaster] ?? undefined,
        farcaster_id: post.parentPost[Source.Farcaster]?.author.profileId ?? undefined,
        farcaster_handle: post.parentPost[Source.Farcaster]?.author.handle ?? undefined,
        include_x_post: post.availableSources.includes(Source.Twitter),
        x_post_id: post.parentPost[Source.Twitter]?.postId ?? undefined,
        x_id: post.parentPost[Source.Twitter]?.author.profileId ?? undefined,
        x_handle: post.parentPost[Source.Twitter]?.author.handle ?? undefined,
        include_image: post.images.length > 0,
        include_video: !!post.video,
        include_lucky_drop: !!post.rpPayload,
        include_poll: !!post.poll,
        is_scheduled: false,
        scheduled_id: undefined,
        poll_id: post.poll?.id,
        lucky_drop_id: undefined,
        lucky_drop_payload_image_url: post.rpPayload?.payloadImage,
    };
}
