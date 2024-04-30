import { createPageable, type Pageable, type PageIndicator } from '@masknet/shared-base';
import type { TweetV2PaginableTimelineResult } from 'twitter-api-v2';

import { SocialPlatform } from '@/constants/enum.js';
import { type Post, type PostType, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatTwitterPostFromFirefly(data: TweetV2PaginableTimelineResult, type?: PostType, currentIndicator?: string): Pageable<Post, PageIndicator> {
    const posts = data.data.map((item) => {
        const user = data.includes?.users?.find(u => u.id === item.author_id)
        return {
            publicationId: item.id,
            postId: item.id,
            type,
            source: SocialPlatform.Twitter,
            author: {
                profileId: item.author_id!,
                displayName: user?.name!,
                handle: user?.username!,
                fullHandle: user?.username!,
                pfp: user?.profile_image_url!,
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: user?.verified ?? false,
                source: SocialPlatform.Twitter,
            },
            timestamp: item?.created_at ? new Date(item.created_at).getTime() : Date.now(),
            metadata: {
                locale: item.lang!,
                content: {
                    content: item.text,
                    attachments: item.attachments?.media_keys?.map(key => {
                        const media = data.includes?.media?.find(m => m.media_key === key)
                        if (!media) return null
                        const coverUri = media.preview_image_url
                        if (media.type === 'video') {
                            return {
                                type: 'Image',
                                uri: media.variants?.[0].url,
                                coverUri,
                            }
                        }
                        return {
                            type: 'Image',
                            uri: media.url,
                            coverUri,
                        }
                    }).filter(media => media)
                }
            }
        } as Post
    })
    return createPageable(posts, currentIndicator ?? '', data.meta.next_token) as any
}
