export enum EventType {
    Debug = 'debug',
    Access = 'access',
    Exit = 'exit',
    Interact = 'interact',
}

export enum ExceptionType {
    Error = 'Error',
}

export enum EventId {
    SEND_CROSS_POST_SUCCESS = 'send_cross_post_success',
    CREATE_SCHEDULED_POST = 'create_scheduled_post',
    SEND_TIPS_SUCCESS = 'send_tips_success',
    CREATE_LUCKY_DROP_SUCCESS = 'create_lucky_drop_success',
    CREATE_POLL_SUCCESS = 'create_poll_success',
    FARCASTER_SEND_POST_SUCCESS = 'farcaster_send_post_success',
    FARCASTER_LIKE_SUCCESS = 'farcaster_like_success',
    FARCASTER_REPLY_SUCCESS = 'farcaster_reply_success',
    FARCASTER_RECAST_SUCCESS = 'farcaster_recast_success',
    FARCASTER_QUOTE_SUCCESS = 'farcaster_quote_success',
    FARCASTER_SHARE_SUCCESS = 'farcaster_share_success',
    FARCASTER_FOLLOW_SUCCESS = 'farcaster_follow_success',
    FARCASTER_BOOKMARK_SUCCESS = 'farcaster_bookmark_success',
    LENS_SEND_POST_SUCCESS = 'lens_send_post_success',
    LENS_LIKE_SUCCESS = 'lens_like_success',
    LENS_MIRROR_SUCCESS = 'lens_mirror_success',
    LENS_QUOTE_SUCCESS = 'lens_quote_success',
    LENS_SHARE_SUCCESS = 'lens_share_success',
    LENS_FOLLOW_SUCCESS = 'lens_follow_success',
    LENS_BOOKMARK_SUCCESS = 'lens_bookmark_success',
    X_SEND_POST_SUCCESS = 'x_send_post_success',
    X_REPLY_SUCCESS = 'x_reply_success',
    X_LIKE_SUCCESS = 'x_like_success',
    X_QUOTE_SUCCESS = 'x_quote_success',
    X_REPOST_SUCCESS = 'x_repost_success',
    X_SHARE_SUCCESS = 'x_share_success',
    X_FOLLOW_SUCCESS = 'x_follow_success',
    X_BOOKMARK_SUCCESS = 'x_bookmark_success',
}

export enum ExceptionId {}

export interface Event {
    type: EventType;
    // bypassing the type check
    parameters: {};
}

export interface Exception {
    type: ExceptionType;
    error: Error;
}

export abstract class Provider<
    Events extends Record<EventId, Event>,
    Exceptions extends Record<ExceptionId, Exception>,
> {
    abstract captureEvent<T extends EventId>(name: EventId, parameters: Events[T]): void;
    abstract captureException<T extends ExceptionId>(name: ExceptionId, parameters: Exceptions[T]): void;
}
