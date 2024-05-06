import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@masknet/shared-base';
import type { TweetV2, TweetV2PaginableTimelineResult } from 'twitter-api-v2';
import type { ApiV2Includes } from 'twitter-api-v2/dist/esm/types/v2/tweet.definition.v2.js';

import { SocialPlatform } from '@/constants/enum.js';
import { type Attachment, type Post, type PostType, ProfileStatus } from '@/providers/types/SocialMedia.js';

function tweetV2ToPost(item: TweetV2, type?: PostType, includes?: ApiV2Includes): Post {
    const user = includes?.users?.find((u) => u.id === item.author_id);
    const repliedTweetId = item.referenced_tweets?.find((tweet) => tweet.type === 'replied_to')?.id;
    const repliedTweet = repliedTweetId ? includes?.tweets?.find((tweet) => tweet.id === repliedTweetId) : undefined;
    const ret: Post = {
        publicationId: item.id,
        postId: item.id,
        type,
        source: SocialPlatform.Twitter,
        author: {
            profileId: item.author_id!,
            displayName: user?.name ?? '',
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
                attachments: item.attachments?.media_keys
                    ?.map((key) => {
                        const media = includes?.media?.find((m) => m.media_key === key);
                        if (!media) return null;
                        const coverUri = media.preview_image_url;
                        if (media.type === 'video') {
                            return {
                                type: 'Image',
                                uri: media.variants?.[0].url,
                                coverUri,
                            };
                        }
                        return {
                            type: 'Image',
                            uri: media.url,
                            coverUri,
                        };
                    })
                    .filter((media) => media)
                    .map((media) => media as Attachment),
            },
        },
    };
    if (repliedTweet) {
        ret.commentOn = tweetV2ToPost(repliedTweet, type, includes);
        let endCommentOn = ret.commentOn;
        while (endCommentOn?.commentOn) {
            endCommentOn = endCommentOn?.commentOn;
        }
        const hasReplied = repliedTweet?.referenced_tweets?.find((tweet) => tweet.type === 'replied_to');
        if (!hasReplied) {
            ret.root = tweetV2ToPost(repliedTweet, type, includes);
        } else if (endCommentOn) {
            ret.root = endCommentOn;
        }
        if (ret.root?.postId === ret.commentOn?.postId) {
            delete ret.root
        }
    }
    return ret;
}

export function formatTwitterPostFromFirefly(
    data: TweetV2PaginableTimelineResult,
    type?: PostType,
    currentIndicator?: PageIndicator,
): Pageable<Post, PageIndicator> {
    const posts = data.data?.map((item) => tweetV2ToPost(item, type, data.includes)) || [];
    console.log(posts)
    return createPageable(
        posts,
        createIndicator(currentIndicator),
        data.meta.next_token ? createIndicator(undefined, data.meta.next_token) : undefined,
    );
}
