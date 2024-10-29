import { compact, find, first, last } from 'lodash-es';
import type { ApiV2Includes, TweetV2, TweetV2PaginableTimelineResult } from 'twitter-api-v2';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { SITE_URL } from '@/constants/index.js';
import { POLL_CHOICE_TYPE, POLL_STRATEGIES } from '@/constants/poll.js';
import { formatTwitterMedia } from '@/helpers/formatTwitterMedia.js';
import { convertTwitterAvatar } from '@/helpers/formatTwitterProfile.js';
import { getEmbedUrls } from '@/helpers/getEmbedUrls.js';
import { isSamePost } from '@/helpers/isSamePost.js';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { type Post, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function tweetV2ToPost(item: TweetV2, includes?: ApiV2Includes): Post {
    const user = includes?.users?.find((u) => u.id === item.author_id);
    const repliedTweetId = item.referenced_tweets?.find((tweet) => tweet.type === 'replied_to')?.id;
    const repliedTweet = repliedTweetId ? includes?.tweets?.find((tweet) => tweet.id === repliedTweetId) : undefined;
    const quotedTweetId = item.referenced_tweets?.find((tweet) => tweet.type === 'quoted')?.id;
    const quotedTweet = quotedTweetId ? includes?.tweets?.find((tweet) => tweet.id === quotedTweetId) : undefined;
    const retweeted = item.referenced_tweets?.find((tweet) => tweet.type === 'retweeted');
    const retweetedTweet = retweeted ? includes?.tweets?.find((tweet) => tweet.id === retweeted.id) : undefined;
    const attachments = compact(
        item.attachments?.media_keys?.map((key) => {
            const media = includes?.media?.find((m) => m.media_key === key);
            return media ? formatTwitterMedia(media) : null;
        }),
    );
    let content = item.note_tweet?.text || item.text || '';
    const parsedEntitiesUrls = item.entities?.urls?.reduce(
        (acc, url) => {
            const length = url.end - url.start;
            const spliceItems = url.expanded_url.split('');
            acc.contentArr.splice(url.start + acc.offsetIndex, length, ...spliceItems);
            acc.offsetIndex += spliceItems.length - length;
            return acc;
        },
        {
            contentArr: content.split(''),
            offsetIndex: 0,
        },
    );
    if (parsedEntitiesUrls) {
        content = parsedEntitiesUrls.contentArr.join('');
    }
    const oembedUrls = getEmbedUrls(content, []);

    if (repliedTweetId) {
        content = content.replace(/^(@\w+\s*)+/, '');
    }

    const ret: Post = {
        publicationId: item.id,
        postId: item.id,
        type: 'Post',
        source: Source.Twitter,
        canComment: true,
        author: {
            profileId: item.author_id!,
            displayName: user?.name ?? '',
            handle: user?.username!,
            fullHandle: user?.username!,
            pfp: convertTwitterAvatar(user?.profile_image_url!),
            followerCount: 0,
            followingCount: 0,
            status: ProfileStatus.Active,
            verified: user?.verified ?? false,
            source: Source.Twitter,
            viewerContext: {
                following: user?.connection_status?.some((status) => status === 'following'),
            },
        },
        stats: {
            reactions: item.public_metrics?.like_count ?? 0,
            comments: item.public_metrics?.reply_count ?? 0,
            mirrors: item.public_metrics?.retweet_count ?? 0,
            quotes: item.public_metrics?.quote_count ?? 0,
        },
        timestamp: item?.created_at ? new Date(item.created_at).getTime() : Date.now(),
        mentions: item?.entities?.mentions?.map((mention) => {
            return {
                profileId: mention.id,
                displayName: mention.username,
                handle: mention.username,
                fullHandle: mention.username,
                pfp: '',
                source: Source.Twitter,
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: true,
            };
        }),
        metadata: {
            locale: item.lang!,
            content: {
                content,
                asset: attachments?.[0],
                attachments,
                oembedUrl: last(oembedUrls),
                oembedUrls,
            },
            // @ts-ignore twitter-api-v2 doesn't have `tweet.article` yet
            article: item.article
                ? {
                      cover: urlcat(SITE_URL, '/api/twitter/article/:id/image', {
                          id: item.id,
                      }),
                      // @ts-ignore twitter-api-v2 doesn't have `tweet.article` yet
                      title: item.article.title,
                  }
                : undefined,
        },
        __original__: item,
    };
    if (repliedTweet) {
        ret.type = 'Comment';
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
    if (quotedTweet) {
        ret.quoteOn = tweetV2ToPost(quotedTweet, includes);
        ret.type = 'Quote';
    }
    if (retweeted) {
        ret.type = 'Mirror';
        if (retweetedTweet) {
            ret.mirrorOn = tweetV2ToPost(retweetedTweet, includes);
            ret.postId = retweetedTweet.id;
            // @ts-ignore twitter-api-v2 doesn't have `tweet.article` yet
            ret.metadata.article = retweetedTweet.article
                ? {
                      cover: urlcat(SITE_URL, '/api/twitter/article/:id/image', {
                          id: retweetedTweet.id,
                      }),
                      // @ts-ignore twitter-api-v2 doesn't have `tweet.article` yet
                      title: retweetedTweet.article.title,
                  }
                : undefined;
        }
        const content = ret.metadata.content?.content ?? '';
        const mention = item.entities?.mentions.sort((a, b) => a.start - b.start)?.[0];
        if (mention) {
            if (content?.startsWith('RT @')) {
                let newContent = content.substring(mention.end);
                if (newContent.startsWith(': ')) newContent = newContent.substring(2);
                ret.metadata.content!.content = newContent;
            }
            const author = includes?.users?.find((user) => user.id === mention.id);
            ret.reporter = ret.author;
            ret.parentPostId = retweeted.id;
            ret.author = {
                profileId: mention.id,
                displayName: author?.name ?? mention?.username ?? '',
                handle: mention?.username!,
                fullHandle: mention?.username!,
                pfp: convertTwitterAvatar(author?.profile_image_url ?? ''),
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: false,
                source: Source.Twitter,
            };
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
    const posts = data.data?.map((item) => tweetV2ToPost(item, data.includes)) || [];
    return createPageable(
        posts,
        createIndicator(currentIndicator),
        data.meta?.next_token ? createIndicator(undefined, data.meta.next_token) : undefined,
    );
}
