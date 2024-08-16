import { safeUnreachable } from '@masknet/kit';
import { first, last } from 'lodash-es';
import type { MediaObjectV2, MediaVariantsV2 } from 'twitter-api-v2';

import { type Attachment } from '@/providers/types/SocialMedia.js';

/**
 * use m3u8 link first if available
 * then use mp4 link with highest bitrate
 * TODO: Maybe we can choose video on network speed
 */
function getBestVideoUrl(variants: MediaVariantsV2[]) {
    const m3u8Variant = variants.find((v) => v.content_type === 'application/x-mpegURL');
    if (m3u8Variant?.url) return m3u8Variant.url;

    const mp4Variants = variants.filter((v) => v.content_type === 'video/mp4');
    return last(mp4Variants)?.url ?? first(variants)?.url;
}

export function formatTwitterMedia(twitterMedia: MediaObjectV2): Attachment | null {
    switch (twitterMedia.type) {
        case 'photo':
            return twitterMedia.url
                ? {
                      type: 'Image',
                      uri: twitterMedia.url,
                  }
                : null;
        case 'animated_gif':
            return twitterMedia.variants?.[0].url
                ? {
                      type: 'AnimatedGif',
                      uri: twitterMedia.variants[0].url,
                      coverUri: twitterMedia.preview_image_url,
                  }
                : null;
        case 'video':
            const uri = getBestVideoUrl(twitterMedia.variants ?? []);
            return uri
                ? {
                      type: 'Video',
                      uri,
                      coverUri: twitterMedia.preview_image_url,
                  }
                : null;
        default:
            safeUnreachable(twitterMedia.type as never);
            return null;
    }
}
