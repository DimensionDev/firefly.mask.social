import { compact } from '@apollo/client/utilities';

import { Source } from '@/constants/enum.js';
import { readChars } from '@/helpers/chars.js';
import { downloadMediaObjects } from '@/helpers/downloadMediaObjects.js';
import { createTwitterMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { resolveTwitterReplyRestriction } from '@/helpers/resolveTwitterReplyRestriction.js';
import { TwitterPollProvider } from '@/providers/twitter/Poll.js';
import { uploadToTwitter, uploadVideoToTwitter } from '@/services/uploadToTwitter.js';
import { type CompositePost } from '@/store/useComposeStore.js';
import { type ComposeType } from '@/types/compose.js';

export interface TwitterSchedulePostPayload {
    quote_tweet_id?: string;
    reply?: {
        exclude_reply_user_ids: [];
        in_reply_to_tweet_id: string;
    };
    text: string;
    media?: {
        media_ids: string[];
    };
    reply_settings?: 'following' | 'mentionedUsers';
    poll?: {
        options: string[];
        duration_minutes: number;
    };
}

export async function createTwitterSchedulePostPayload(
    type: ComposeType,
    compositePost: CompositePost,
    isThread = false,
): Promise<TwitterSchedulePostPayload> {
    const { chars, images, video, parentPost, restriction, poll } = compositePost;

    const twitterParentPost = parentPost.Twitter;

    const confirmedMedias = await downloadMediaObjects(images);
    const imageResults = (await uploadToTwitter(confirmedMedias.map((x) => ({ file: x.file })))).map((x, index) =>
        createTwitterMediaObject(x, confirmedMedias[index]),
    );
    const videoResults = video
        ? (await uploadVideoToTwitter(video.file)).map((x) => createTwitterMediaObject(x, video))
        : [];

    const mediaResults = [...imageResults, ...videoResults];

    const pollResult = poll ? await TwitterPollProvider.createPoll(poll) : undefined;

    return {
        quote_tweet_id: twitterParentPost && type === 'quote' ? twitterParentPost.postId : undefined,
        reply:
            type === 'reply'
                ? twitterParentPost
                    ? { exclude_reply_user_ids: [], in_reply_to_tweet_id: twitterParentPost.postId }
                    : isThread
                      ? { exclude_reply_user_ids: [], in_reply_to_tweet_id: '$$in_reply_to_tweet_id$$' }
                      : undefined
                : undefined,
        text: readChars(chars, 'both', Source.Twitter),
        media: mediaResults.length
            ? {
                  media_ids: compact(mediaResults?.map((x) => x.id)),
              }
            : undefined,
        reply_settings: resolveTwitterReplyRestriction(restriction),
        poll: pollResult
            ? {
                  options: pollResult.options.map((option) => option.label),
                  duration_minutes: Math.floor(pollResult.durationSeconds / 60),
              }
            : undefined,
    };
}
