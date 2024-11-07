// cspell:disable

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
    DEBUG = 'debug',

    ACCOUNT_CREATE_SUCCESS = 'account_create_success',
    ACCOUNT_LOG_OUT_ALL_SUCCESS = 'account_log_out_all_success', // ✅

    // compose dialog
    COMPOSE_CROSS_POST_SEND_SUCCESS = 'cross_post_send_success', // ✅
    COMPOSE_SCHEDULED_POST_CREATE_SUCCESS = 'scheduled_post_create_success', // ✅
    COMPOSE_SCHEDULED_POST_UPDATE_SUCCESS = 'scheduled_post_update_success', // ✅
    COMPOSE_SCHEDULED_POST_DELETE_SUCCESS = 'scheduled_post_delete_success', // ✅
    COMPOSE_DRAFT_CREATE_SUCCESS = 'draft_create_success', // ✅
    COMPOSE_DRAFT_BUTTON_CLICK = 'draft_button_click', // ✅

    // mute
    MUTE_ALL_SUCCESS = 'mute_all_success', // ✅
    MUTE_SUCCESS = 'mute_success', // ✅
    UNMUTE_SUCCESS = 'unmute_success', // ✅

    TIPS_SEND_SUCCESS = 'tips_send_success', // ✅
    POLL_CREATE_SUCCESS = 'poll_create_success', // ✅
    LUCKY_DROP_CREATE_SUCCESS = 'lucky_drop_create_success',

    // token sync dialog
    TOKEN_SYNC_USE_YES = 'token_sync_use_yes', // ✅
    TOKEN_SYNC_USE_NO = 'token_sync_use_no', // ✅

    // connect wallet
    CONNECT_WALLET_SUCCESS = 'connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_METAMASK = 'metamask_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_RABBY = 'rabby_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_WALLET_CONNECT = 'walletconnect_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_COINBASE = 'coinbase_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_PARTICLE = 'particle_generate_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_BINANCE = 'binancewallet_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_OKX = 'okxwallet_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_ZERION = 'zerion_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_RAINBOW = 'rainbow_connect_wallet_success', // ✅
    CONNECT_WALLET_SUCCESS_PHANTOM = 'phantom_connect_wallet_success', // ✅

    // farcaster
    FARCASTER_LOG_IN_SUCCESS = 'farcaster_log_in_success', // ✅
    FARCASTER_LOG_OUT_SUCCESS = 'farcaster_log_out_success', // ✅
    FARCASTER_ACCOUNT_DISCONNECT_SUCCESS = 'account_farcaster_disconnect_success',
    FARCASTER_POST_SEND_SUCCESS = 'farcaster_cast_send_success', // ✅
    FARCASTER_POST_LIKE_SUCCESS = 'farcaster_cast_like_success', // ✅
    FARCASTER_POST_UNLIKE_SUCCESS = 'farcaster_cast_unlike_success', // ✅
    FARCASTER_POST_REPLY_SUCCESS = 'farcaster_cast_reply_success', // ✅
    FARCASTER_POST_REPOST_SUCCESS = 'farcaster_cast_recast_success', // ✅
    FARCASTER_POST_UNDO_REPOST_SUCCESS = 'farcaster_cast_undo_recast_success', // ✅
    FARCASTER_POST_DELETE_SUCCESS = 'farcaster_cast_delete_success', // ✅
    FARCASTER_POST_QUOTE_SUCCESS = 'farcaster_cast_quote_success', // ✅
    FARCASTER_POST_SHARE_SUCCESS = 'farcaster_cast_share_success', // ✅
    FARCASTER_POST_BOOKMARK_SUCCESS = 'farcaster_cast_bookmark_success', // ✅
    FARCASTER_POST_UNBOOKMARK_SUCCESS = 'farcaster_cast_unbookmark_success', // ✅
    FARCASTER_PROFILE_FOLLOW_SUCCESS = 'farcaster_follow_success', // ✅
    FARCASTER_PROFILE_UNFOLLOW_SUCCESS = 'farcaster_unfollow_success', // ✅

    // lens
    LENS_ACCOUNT_LOG_IN_SUCCESS = 'lens_log_in_success', // ✅
    LENS_ACCOUNT_LOG_OUT_SUCCESS = 'lens_log_out_success', // ✅
    LENS_ACCOUNT_DISCONNECT_SUCCESS = 'account_lens_disconnect_success',
    LENS_POST_SEND_SUCCESS = 'lens_post_send_success', // ✅
    LENS_POST_LIKE_SUCCESS = 'lens_post_like_success', // ✅
    LENS_POST_UNLIKE_SUCCESS = 'lens_post_unlike_success', // ✅
    LENS_POST_REPLY_SUCCESS = 'lens_post_reply_success', // ✅
    LENS_POST_REPOST_SUCCESS = 'lens_post_mirror_success', // ✅
    LENS_POST_UNDO_REPOST_SUCCESS = 'lens_post_unmirror_success', // ✅
    LENS_POST_DELETE_SUCCESS = 'lens_post_delete_success', // ✅
    LENS_POST_QUOTE_SUCCESS = 'lens_post_quote_success', // ✅
    LENS_POST_SHARE_SUCCESS = 'lens_post_share_success', // ✅
    LENS_POST_BOOKMARK_SUCCESS = 'lens_post_bookmark_success', // ✅
    LENS_POST_UNBOOKMARK_SUCCESS = 'lens_post_unbookmark_success', // ✅
    LENS_PROFILE_FOLLOW_SUCCESS = 'lens_follow_success', // ✅
    LENS_PROFILE_UNFOLLOW_SUCCESS = 'lens_unfollow_success', // ✅

    // x
    X_ACCOUNT_LOG_IN_SUCCESS = 'x_log_in_success', // ✅
    X_ACCOUNT_LOG_OUT_SUCCESS = 'x_log_out_success', // ✅
    X_ACCOUNT_DISCONNECT_SUCCESS = 'account_x_disconnect_success',
    X_POST_SEND_SUCCESS = 'x_post_send_success', // ✅
    X_POST_LIKE_SUCCESS = 'x_post_like_success', // ✅
    X_POST_UNLIKE_SUCCESS = 'x_post_unlike_success', // ✅
    X_POST_REPLY_SUCCESS = 'x_post_reply_success', // ✅
    X_POST_REPOST_SUCCESS = 'x_post_repost_success', // ✅
    X_POST_UNDO_REPOST_SUCCESS = 'x_post_undo_repost_success', // ✅
    X_POST_DELETE_SUCCESS = 'x_post_delete_success', // ✅
    X_POST_QUOTE_SUCCESS = 'x_post_quote_success', // ✅
    X_POST_SHARE_SUCCESS = 'x_post_share_success', // ✅
    X_POST_BOOKMARK_SUCCESS = 'x_post_bookmark_success', // ✅
    X_POST_UNBOOKMARK_SUCCESS = 'x_post_unbookmark_success', // ✅
    X_PROFILE_FOLLOW_SUCCESS = 'x_follow_success', // ✅
    X_PROFILE_UNFOLLOW_SUCCESS = 'x_unfollow_success', // ✅

    // activity
    EVENT_SHARE_CLICK = 'event_share_click',
    EVENT_X_LOG_IN_SUCCESS = 'event_x_log_in_success',
    EVENT_CONNECT_WALLET_SUCCESS = 'event_connect_wallet_success',
    EVENT_CHANGE_WALLET_SUCCESS = 'event_change_wallet_success',
    EVENT_CLAIM_BASIC_SUCCESS = 'event_claim_basic_success',
    EVENT_CLAIM_PREMIUM_SUCCESS = 'event_claim_premium_success',
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

export interface ConnectWalletEventParameters {
    wallet_type: 'all' | 'evm' | 'solana';
    wallet_id: string;
    wallet_address?: string;
    solana_address?: string;
    firefly_account_id: string;
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

    include_x_poll: boolean;
    x_poll_id?: string;

    include_lens_poll: boolean;
    lens_poll_id?: string;

    include_farcaster_poll: boolean;
    farcaster_poll_id?: string;

    // flags
    include_image: boolean;
    include_video: boolean;
}

export interface Events extends Record<EventId, Event> {
    [EventId.DEBUG]: {
        type: EventType.Debug;
        parameters: {
            message: string;
        };
    };

    [EventId.CONNECT_WALLET_SUCCESS]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_METAMASK]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_RABBY]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_WALLET_CONNECT]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_COINBASE]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_PARTICLE]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_BINANCE]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_OKX]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_ZERION]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_RAINBOW]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };
    [EventId.CONNECT_WALLET_SUCCESS_PHANTOM]: {
        type: EventType.Interact;
        parameters: ConnectWalletEventParameters;
    };

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
        };
    };
    [EventId.COMPOSE_SCHEDULED_POST_DELETE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            schedule_id: string;
            schedule_time: number;
            scheduled_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        };
    };
    [EventId.COMPOSE_DRAFT_CREATE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            draft_id: string;
            draft_time: number;
            draft_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        } & ComposeEventParameters;
    };
    [EventId.COMPOSE_DRAFT_BUTTON_CLICK]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };
    [EventId.MUTE_ALL_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };
    [EventId.MUTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };
    [EventId.UNMUTE_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
        };
    };
    [EventId.TIPS_SEND_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            source_wallet_address: string; // address all lowercased
            target_wallet_address: string; // address all lowercased
            source_firefly_account_id: string;
            target_firefly_account_id?: string;
            amount: string;
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
            amount: string;
            currency: string;
            amount_usd?: number;
            winners: number;
            distribution_rule: 'random' | 'equal';
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

    // Activity
    [EventId.EVENT_SHARE_CLICK]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id?: string;
            activity: string;
        };
    };
    [EventId.EVENT_X_LOG_IN_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            activity: string;
        };
    };
    [EventId.EVENT_CONNECT_WALLET_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            wallet_address: string;
            activity: string;
        };
    };
    [EventId.EVENT_CHANGE_WALLET_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            wallet_address: string;
            activity: string;
        };
    };
    [EventId.EVENT_CLAIM_BASIC_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            wallet_address: string;
            activity: string;
        };
    };
    [EventId.EVENT_CLAIM_PREMIUM_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            wallet_address: string;
            activity: string;
        };
    };
}

export abstract class Provider<
    Events extends Record<EventId, Event>,
    Exceptions extends Record<ExceptionId, Exception>,
> {
    abstract captureEvent<T extends EventId>(name: EventId, parameters: Events[T]['parameters']): Promise<void>;
    abstract captureException<T extends ExceptionId>(name: ExceptionId, error: Exceptions[T]['error']): Promise<void>;
}
