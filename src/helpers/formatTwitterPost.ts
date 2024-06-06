import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { compact, find, first } from 'lodash-es';
import type { ApiV2Includes, TweetV2, TweetV2PaginableTimelineResult } from 'twitter-api-v2';

import { Source } from '@/constants/enum.js';
import { POLL_CHOICE_TYPE, POLL_STRATEGIES } from '@/constants/poll.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { type Attachment, type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function tweetV2ToPost(item: TweetV2, includes?: ApiV2Includes): Post {
    const user = includes?.users?.find((u) => u.id === item.author_id);
    const repliedTweetId = item.referenced_tweets?.find((tweet) => tweet.type === 'replied_to')?.id;
    const repliedTweet = repliedTweetId ? includes?.tweets?.find((tweet) => tweet.id === repliedTweetId) : undefined;
    const isRetweeted = item.referenced_tweets?.find((tweet) => tweet.type === 'retweeted');
    const attachments = compact(
        item.attachments?.media_keys?.map((key) => {
            const media = includes?.media?.find((m) => m.media_key === key);
            let asset: Attachment | null = null;
            if (!media) return asset;
            const coverUri = media.preview_image_url;
            if (media.type === 'video' && media.variants?.[0].url) {
                asset = {
                    type: 'Video',
                    uri: media.variants?.[0].url,
                };
            }
            if (media.url) {
                asset = {
                    type: 'Image',
                    uri: media.url,
                };
                if (coverUri) {
                    asset.coverUri = coverUri;
                }
            }
            return asset;
        }),
    );

    const ret: Post = {
        publicationId: item.id,
        postId: item.id,
        type: repliedTweetId ? 'Comment' : isRetweeted ? 'Mirror' : 'Post',
        source: Source.Twitter,
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
            source: Source.Twitter,
        },
        timestamp: item?.created_at ? new Date(item.created_at).getTime() : Date.now(),
        metadata: {
            locale: item.lang!,
            content: {
                content: item.text,
                asset: attachments?.[0],
                attachments,
            },
        },
    };
    if (repliedTweet) {
        ret.commentOn = tweetV2ToPost(repliedTweet, includes);
        let endCommentOn = ret.commentOn;
        while (endCommentOn?.commentOn) {
            endCommentOn = endCommentOn?.commentOn;
        }
        const hasReplied = repliedTweet?.referenced_tweets?.find((tweet) => tweet.type === 'replied_to');
        if (!hasReplied) {
            ret.root = tweetV2ToPost(repliedTweet, includes);
        } else if (endCommentOn) {
            ret.root = endCommentOn;
        }
        if (isSamePost(ret.root, ret.commentOn)) {
            delete ret.root;
        }
        if (ret.root) {
            ret.isThread = true;
        }
    }
    if (item.attachments?.poll_ids?.length) {
        const poll = find(includes?.polls ?? [], (poll) => poll.id === first(item.attachments?.poll_ids));

        if (poll) {
            ret.poll = {
                id: poll.id,
                options: poll.options.map((x) => ({ ...x, id: x.label })),
                durationSeconds: poll.duration_minutes ? poll.duration_minutes * 60 : 0,
                votingStatus: poll.voting_status,
                endDatetime: poll.end_datetime,
                source: Source.Twitter,
                type: POLL_CHOICE_TYPE.Single,
                strategies: POLL_STRATEGIES.None,
            };
        }
    }
    return ret;
}

export function formatTweetsPage(
    data: TweetV2PaginableTimelineResult,
    currentIndicator?: PageIndicator,
): Pageable<Post, PageIndicator> {
    const posts = data.data.map((item) => tweetV2ToPost(item, data.includes));
    return createPageable(
        posts,
        createIndicator(currentIndicator),
        data.meta.next_token ? createIndicator(undefined, data.meta.next_token) : undefined,
    );
}
