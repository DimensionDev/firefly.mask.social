import type { TweetV2UserTimelineParams, UsersV2Params } from 'twitter-api-v2';
import type { SpaceV2FieldsParams } from 'twitter-api-v2/dist/esm/types/v2/spaces.v2.types.js';

export const TWITTER_TIMELINE_OPTIONS: TweetV2UserTimelineParams = {
    expansions: [
        'attachments.media_keys',
        'attachments.poll_ids',
        'author_id',
        'referenced_tweets.id',
        'referenced_tweets.id.author_id',
        'entities.mentions.username',
        'in_reply_to_user_id',
    ],
    'media.fields': ['media_key', 'height', 'width', 'type', 'url', 'preview_image_url', 'variants'],
    'tweet.fields': [
        'text',
        'note_tweet',
        'attachments',
        'author_id',
        'created_at',
        'lang',
        'public_metrics',
        'referenced_tweets',
        'entities',
    ],
    'user.fields': ['description', 'username', 'name', 'profile_image_url', 'public_metrics', 'connection_status'],
    'poll.fields': ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status'],
};

export const TWITTER_USER_OPTIONS: Partial<UsersV2Params> = {
    'user.fields': [
        'description',
        'username',
        'name',
        'profile_image_url',
        'public_metrics',
        'connection_status',
        'url',
        'location',
        'verified',
        'verified_type',
    ],
};

export const SPACE_OPTIONS: Partial<SpaceV2FieldsParams> = {
    expansions: ['invited_user_ids', 'speaker_ids', 'creator_id', 'host_ids'],
    'space.fields': [
        'created_at',
        'creator_id',
        'invited_user_ids',
        'speaker_ids',
        'started_at',
        'state',
        'title',
        'updated_at',
        'scheduled_start',
        'is_ticketed',
        'topic_ids',
        'ended_at',
        'participant_count',
    ],
    'user.fields': [
        'description',
        'entities',
        'id',
        'name',
        'pinned_tweet_id',
        'profile_image_url',
        'url',
        'username',
        'verified',
        'verified_type',
    ],
};
