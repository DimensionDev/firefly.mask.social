export enum VersionFilter {
    // the current working version
    Latest = 'latest',
    // the next version (disabled for the current version)
    Next = 'next',
}

export enum ProviderFilter {
    All = 'all',
    GA = 'google_analytics',
    Safary = 'safary',
}

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
    ACCOUNT_CREATE_SUCCESS = 'account_create_success',
    ACCOUNT_LOG_OUT_ALL_SUCCESS = 'account_log_out_all_success', // ✅

    // compose dialog
    COMPOSE_CROSS_POST_SEND_SUCCESS = 'send_cross_post_success', // ✅
    COMPOSE_SCHEDULED_POST_CREATE_SUCCESS = 'create_scheduled_post_success', // ✅
    COMPOSE_SCHEDULED_POST_UPDATE_SUCCESS = 'scheduled_post_update_success',
    COMPOSE_SCHEDULED_POST_DELETE_SUCCESS = 'scheduled_post_delete_success',
    COMPOSE_DRAFT_CREATE_SUCCESS = 'draft_create_success', // ✅

    TIPS_SEND_SUCCESS = 'send_tips_success',
    POLL_CREATE_SUCCESS = 'create_poll_success',
    LUCKY_DROP_CREATE_SUCCESS = 'create_lucky_drop_success',

    // token sync dialog
    TOKEN_SYNC_USE_YES = 'token_sync_use_yes', // ✅
    TOKEN_SYNC_USE_NO = 'token_sync_use_no', // ✅

    // farcaster
    FARCASTER_LOG_IN_SUCCESS = 'farcaster_log_in_success', // ✅
    FARCASTER_LOG_OUT_SUCCESS = 'farcaster_log_out_success', // ✅
    FARCASTER_ACCOUNT_DISCONNECT_SUCCESS = 'farcaster_disconnect_account_success',
    FARCASTER_POST_SEND_SUCCESS = 'farcaster_send_cast_success', // ✅
    FARCASTER_POST_DELETE_SUCCESS = 'farcaster_delete_cast_success', // ✅
    FARCASTER_POST_LIKE_SUCCESS = 'farcaster_like_cast_success', // ✅
    FARCASTER_POST_UNLIKE_SUCCESS = 'farcaster_unlike_cast_success', // ✅
    FARCASTER_POST_REPLY_SUCCESS = 'farcaster_reply_cast_success', // ✅
    FARCASTER_POST_REPOST_SUCCESS = 'farcaster_recast_cast_success', // ✅
    FARCASTER_POST_UNDO_REPOST_SUCCESS = 'farcaster_undo_recast_cast_success', // ✅
    FARCASTER_POST_QUOTE_SUCCESS = 'farcaster_quote_cast_success', // ✅
    FARCASTER_POST_SHARE_SUCCESS = 'farcaster_share_cast_success', // ✅
    FARCASTER_POST_BOOKMARK_SUCCESS = 'farcaster_bookmark_cast_success', // ✅
    FARCASTER_POST_UNBOOKMARK_SUCCESS = 'farcaster_unbookmark_cast_success', // ✅
    FARCASTER_PROFILE_FOLLOW_SUCCESS = 'farcaster_follow_profile_success', // ✅
    FARCASTER_PROFILE_UNFOLLOW_SUCCESS = 'farcaster_unfollow_profile_success', // ✅

    // lens
    LENS_ACCOUNT_LOG_IN_SUCCESS = 'lens_log_in_success', // ✅
    LENS_ACCOUNT_LOG_OUT_SUCCESS = 'lens_log_out_success', // ✅
    LENS_ACCOUNT_DISCONNECT_SUCCESS = 'lens_disconnect_account_success',
    LENS_POST_SEND_SUCCESS = 'lens_send_post_success', // ✅
    LENS_POST_LIKE_SUCCESS = 'lens_like_post_success', // ✅
    LENS_POST_UNLIKE_SUCCESS = 'lens_unlike_post_success', // ✅
    LENS_POST_REPLY_SUCCESS = 'lens_reply_post_success', // ✅
    LENS_POST_REPOST_SUCCESS = 'lens_mirror_post_success', // ✅
    LENS_POST_UNDO_REPOST_SUCCESS = 'lens_unmirror_post_success', // ✅
    LENS_POST_DELETE_SUCCESS = 'lens_delete_post_success', // ✅
    LENS_POST_QUOTE_SUCCESS = 'lens_quote_post_success', // ✅
    LENS_POST_SHARE_SUCCESS = 'lens_share_post_success', // ✅
    LENS_POST_BOOKMARK_SUCCESS = 'lens_bookmark_post_success', // ✅
    LENS_POST_UNBOOKMARK_SUCCESS = 'lens_unbookmark_post_success', // ✅
    LENS_PROFILE_FOLLOW_SUCCESS = 'lens_follow_profile_success', // ✅
    LENS_PROFILE_UNFOLLOW_SUCCESS = 'lens_unfollow_profile_success', // ✅

    // x
    X_ACCOUNT_LOG_IN_SUCCESS = 'x_log_in_success', // ✅
    X_ACCOUNT_LOG_OUT_SUCCESS = 'x_log_out_success', // ✅
    X_ACCOUNT_DISCONNECT_SUCCESS = 'x_disconnect_account_success',
    X_POST_SEND_SUCCESS = 'x_send_post_success', // ✅
    X_POST_DELETE_SUCCESS = 'x_delete_post_success', // ✅
    X_POST_REPLY_SUCCESS = 'x_reply_post_success', // ✅
    X_POST_LIKE_SUCCESS = 'x_like_post_success', // ✅
    X_POST_UNLIKE_SUCCESS = 'x_unlike_post_success', // ✅
    X_POST_QUOTE_SUCCESS = 'x_quote_post_success', // ✅
    X_POST_REPOST_SUCCESS = 'x_repost_post_success', // ✅
    X_POST_UNDO_REPOST_SUCCESS = 'x_undo_repost_post_success', // ✅
    X_POST_SHARE_SUCCESS = 'x_share_post_success', // ✅
    X_POST_BOOKMARK_SUCCESS = 'x_bookmark_post_success', // ✅
    X_POST_UNBOOKMARK_SUCCESS = 'x_unbookmark_post_success', // ✅
    X_PROFILE_FOLLOW_SUCCESS = 'x_follow_profile_success', // ✅
    X_PROFILE_UNFOLLOW_SUCCESS = 'x_unfollow_profile_success', // ✅
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

export interface FarcasterEventParameters {
    source_firefly_account_id: string;
    source_farcaster_handle: string;
    source_farcaster_id: string;
    target_farcaster_id?: string;
    target_farcaster_handle?: string;
}

export interface FarcasterPostEventParameters extends FarcasterEventParameters {
    target_farcaster_cast_id: string;
}

export interface LensEventParameters {
    source_firefly_account_id: string;
    source_lens_id: string;
    source_lens_handle: string;
    target_lens_id: string;
    target_lens_handle: string;
}

export interface LensPostEventParameters extends LensEventParameters {
    target_lens_post_id: string;
}

export interface TwitterEventParameters {
    source_firefly_account_id: string;
    source_x_id: string;
    source_x_handle: string;
    target_x_id: string;
    target_x_handle: string;
}

export interface TwitterPostEventParameters extends TwitterEventParameters {
    target_x_post_id: string;
}

export interface ComposeEventParameters {
    firefly_account_id: string;

    // lens
    include_lens_post: boolean;
    lens_id?: string;
    lens_handle?: string;
    lens_post_ids?: string[];

    // farcaster
    include_farcaster_cast: boolean;
    farcaster_id?: string;
    farcaster_handle?: string;
    farcaster_cast_ids?: string[];

    // twitter
    include_x_post: boolean;
    x_id?: string;
    x_handle?: string;
    x_post_ids?: string[];

    // thread
    is_thread: boolean;

    // draft
    is_draft: boolean;
    draft_id?: string;

    // schedule
    is_scheduled: boolean;
    schedule_id?: string;

    // rp
    include_lucky_drop: boolean;
    lucky_drop_ids?: string[];

    // poll
    include_poll: boolean;
    poll_id?: string;

    // flags
    include_image: boolean;
    include_video: boolean;
}

export interface Events extends Record<EventId, Event> {
    [EventId.COMPOSE_CROSS_POST_SEND_SUCCESS]: {
        type: EventType.Interact;
        parameters: {} & ComposeEventParameters;
    };
    [EventId.COMPOSE_SCHEDULED_POST_CREATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            schedule_id: string;
            schedule_time: number;
            scheduled_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        } & ComposeEventParameters;
    };
    [EventId.COMPOSE_SCHEDULED_POST_UPDATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            schedule_id: string;
            new_schedule_time: number;
            new_scheduled_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        } & ComposeEventParameters;
    };
    [EventId.COMPOSE_SCHEDULED_POST_DELETE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            schedule_id: string;
            schedule_time: number;
            scheduled_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        } & ComposeEventParameters;
    };
    [EventId.COMPOSE_DRAFT_CREATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            draft_id: string;
            draft_time: number;
            draft_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        } & ComposeEventParameters;
    };
    [EventId.TIPS_SEND_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            source_wallet_address: string; // address all lowercased
            target_wallet_address: string; // address all lowercased
            source_firefly_account_id: string;
            target_firefly_account_id?: string;
            amount: number;
            currency: string;
            amount_usd?: number;
            chain_id: number;
            chain_name: string;
        };
    };
    [EventId.LUCKY_DROP_CREATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            wallet_address: string; // address all lowercased
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
    [EventId.POLL_CREATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            poll_id: string;
        };
    };
    [EventId.ACCOUNT_CREATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;

            // lens
            by_lens: boolean;
            lens_id?: string;
            lens_handle?: string;

            // farcaster
            by_farcaster: boolean;
            farcaster_id?: string;
            farcaster_handle?: string;

            // x
            by_x: boolean;
            x_id?: string;
            x_handle?: string;
        };
    };
    [EventId.ACCOUNT_LOG_OUT_ALL_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };
    [EventId.TOKEN_SYNC_USE_YES]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };
    [EventId.TOKEN_SYNC_USE_NO]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };

    // ----------------
    // farcaster
    // ----------------

    [EventId.FARCASTER_LOG_IN_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            is_token_sync: boolean;
            farcaster_accounts: Array<[string, string]>; // [id, handle]
        };
    };
    [EventId.FARCASTER_LOG_OUT_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            farcaster_id: string;
            farcaster_handle: string;
        };
    };
    [EventId.FARCASTER_ACCOUNT_DISCONNECT_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            farcaster_id: string;
            farcaster_handle: string;
        };
    };
    [EventId.FARCASTER_POST_SEND_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            farcaster_cast_ids?: string[];
        } & ComposeEventParameters;
    };
    [EventId.FARCASTER_POST_DELETE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            farcaster_id: string;
            farcaster_handle: string;
            farcaster_cast_id: string;
        };
    };
    [EventId.FARCASTER_POST_LIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_UNLIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_REPLY_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_UNDO_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_QUOTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_SHARE_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_POST_BOOKMARK_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterPostEventParameters;
    };
    [EventId.FARCASTER_PROFILE_FOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    [EventId.FARCASTER_PROFILE_UNFOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };

    // ----------------
    // lens
    // ----------------

    [EventId.LENS_ACCOUNT_LOG_IN_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            is_token_sync: boolean;
            lens_accounts: Array<[string, string]>; // [id, handle]
        };
    };
    [EventId.LENS_ACCOUNT_LOG_OUT_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            lens_id: string;
            lens_handle: string;
        };
    };
    [EventId.LENS_ACCOUNT_DISCONNECT_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            lens_id: string;
            lens_handle: string;
        };
    };
    [EventId.LENS_POST_SEND_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            lens_post_ids?: string[];
        } & ComposeEventParameters;
    };
    [EventId.LENS_POST_LIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_UNLIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_REPLY_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_UNDO_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_DELETE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            lens_id: string;
            lens_handle: string;
            lens_post_id: string;
        };
    };
    [EventId.LENS_POST_QUOTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_SHARE_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_POST_BOOKMARK_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensPostEventParameters;
    };
    [EventId.LENS_PROFILE_FOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    [EventId.LENS_PROFILE_UNFOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };

    // ----------------
    // x
    // ----------------

    [EventId.X_ACCOUNT_LOG_IN_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            is_token_sync: boolean;
            x_accounts: Array<[string, string]>; // [id, handle]
        };
    };
    [EventId.X_ACCOUNT_LOG_OUT_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            x_id: string;
            x_handle: string;
        };
    };
    [EventId.X_ACCOUNT_DISCONNECT_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            x_id: string;
            x_handle: string;
        };
    };
    [EventId.X_POST_SEND_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            x_post_ids?: string[];
        } & ComposeEventParameters;
    };
    [EventId.X_POST_DELETE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            x_id: string;
            x_handle: string;
            x_post_id: string;
        };
    };
    [EventId.X_POST_REPLY_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_LIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_UNLIKE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_QUOTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_UNDO_REPOST_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_SHARE_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_POST_BOOKMARK_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterPostEventParameters;
    };
    [EventId.X_PROFILE_FOLLOW_SUCCESS]: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    [EventId.X_PROFILE_UNFOLLOW_SUCCESS]: {
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
