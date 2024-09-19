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
    SEND_TIPS_SUCCESS = 'send_tips_success',
    CREATE_SCHEDULED_POST = 'create_scheduled_post',
    CREATE_LUCKY_DROP_SUCCESS = 'create_lucky_drop_success',
    CREATE_POLL_SUCCESS = 'create_poll_success',

    // farcaster
    FARCASTER_SEND_POST_SUCCESS = 'farcaster_send_post_success',
    FARCASTER_LIKE_SUCCESS = 'farcaster_like_success',
    FARCASTER_REPLY_SUCCESS = 'farcaster_reply_success',
    FARCASTER_RECAST_SUCCESS = 'farcaster_recast_success',
    FARCASTER_QUOTE_SUCCESS = 'farcaster_quote_success',
    FARCASTER_SHARE_SUCCESS = 'farcaster_share_success',
    FARCASTER_FOLLOW_SUCCESS = 'farcaster_follow_success',
    FARCASTER_BOOKMARK_SUCCESS = 'farcaster_bookmark_success',

    // lens
    LENS_SEND_POST_SUCCESS = 'lens_send_post_success',
    LENS_LIKE_SUCCESS = 'lens_like_success',
    LENS_MIRROR_SUCCESS = 'lens_mirror_success',
    LENS_QUOTE_SUCCESS = 'lens_quote_success',
    LENS_SHARE_SUCCESS = 'lens_share_success',
    LENS_FOLLOW_SUCCESS = 'lens_follow_success',
    LENS_BOOKMARK_SUCCESS = 'lens_bookmark_success',

    // twitter
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

interface FarcasterEventParameters {
    source_firefly_account_id: string;
    source_farcaster_handle: string;
    source_farcaster_id: string;
    target_farcaster_id?: string;
    target_farcaster_handle?: string;
    target_farcaster_cast_id: string;
}

interface LensEventParameters {
    source_firefly_account_id: string;
    source_lens_handle: string;
    target_lens_handle: string;
    target_lens_post_id: string;
}

interface TwitterEventParameters {
    source_firefly_account_id: string;
    source_x_handle: string;
    target_x_handle: string;
    target_x_post_id: string;
}

interface PostEventParameters {
    include_image: boolean;
    include_video: boolean;
    include_lucky_drop: boolean;
    include_poll: boolean;
    is_scheduled: boolean;
    scheduled_id?: string;
    lucky_drop_id?: string;
    lucky_drop_payload_image_url?: string;
    poll_id?: string;
}

export interface Events extends Record<EventId, Event> {
    [EventId.SEND_CROSS_POST_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            include_lens_post?: boolean;
            lens_post_id?: string;
            lens_id?: string;
            lens_handle?: string;
            include_farcaster_cast?: boolean;
            farcaster_cast_id?: string;
            farcaster_id?: string;
            farcaster_handle?: string;
            include_x_post?: boolean;
            x_post_id?: string;
            x_id?: string;
            x_handle?: string;
        } & PostEventParameters;
    };
    [EventId.CREATE_SCHEDULED_POST]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            include_lens_post?: boolean;
            lens_post_id?: string;
            lens_id?: string;
            lens_handle?: string;
            include_farcaster_cast?: boolean;
            farcaster_cast_id?: string;
            farcaster_id?: string;
            farcaster_handle?: string;
            include_x_post?: boolean;
            x_post_id?: string;
            x_id?: string;
            x_handle?: string;
            scheduled_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        };
    };
    [EventId.SEND_TIPS_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            source_wallet_address: string;
            target_wallet_address: string;
            source_firefly_account_id: string;
            target_firefly_account_id?: string;
            amount: number;
            currency: string;
            amount_usd?: number;
            chain_id: number;
            chain_name: string;
        };
    };
    [EventId.CREATE_LUCKY_DROP_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            wallet_address: string;
            firefly_account_id: string;
            lucky_drop_id: string;
            amount: number;
            currency: string;
            amount_usd?: number;
            winners: number;
            distribution_rule: string;
            chain_id: string;
            chain_name: string;
        };
    };
    [EventId.CREATE_POLL_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            poll_id: string;
            firefly_account_id: string;
        };
    };
    [EventId.FARCASTER_SEND_POST_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            farcaster_cast_id: string;
            farcaster_id: string;
            farcaster_handle: string;
        } & PostEventParameters;
    };
    [EventId.FARCASTER_LIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_REPLY_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_RECAST_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_QUOTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_SHARE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_FOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_BOOKMARK_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.LENS_SEND_POST_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            lens_post_id: string;
            lens_handle: string;
        } & PostEventParameters;
    };
    [EventId.LENS_LIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    [EventId.LENS_MIRROR_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    [EventId.LENS_QUOTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    [EventId.LENS_SHARE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    [EventId.LENS_FOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: Omit<LensEventParameters, 'target_lens_post_id'>;
    };
    [EventId.LENS_BOOKMARK_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    [EventId.X_SEND_POST_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            x_post_id: string;
            x_id: string;
            x_handle: string;
        } & PostEventParameters;
    };
    [EventId.X_REPLY_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    [EventId.X_LIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    [EventId.X_QUOTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    [EventId.X_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    [EventId.X_SHARE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    [EventId.X_FOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: Omit<TwitterEventParameters, 'target_x_post_id'>;
    };
    [EventId.X_BOOKMARK_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
}

export abstract class Provider<
    Events extends Record<EventId, Event>,
    Exceptions extends Record<ExceptionId, Exception>,
> {
    abstract captureEvent<T extends EventId>(name: EventId, parameters: Events[T]['parameters']): Promise<void>;
    abstract captureException<T extends ExceptionId>(name: ExceptionId, error: Exceptions[T]['error']): Promise<void>;
}
