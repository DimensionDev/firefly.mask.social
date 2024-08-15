import { type Event, EventId, EventType } from '@/providers/types/Telemetry.js';

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
    firefly_account_id: string;
    include_image: boolean;
    include_video: boolean;
    include_lucky_drop: boolean;
    include_poll: boolean;
    is_scheduled: boolean;
    scheduled_id?: string;
    lucky_drop_id?: string;
    poll_id?: string;
}

export interface Events extends Record<EventId, Event> {
    [EventId.SEND_CROSS_POST_SUCCESS]: {
        type: EventType.Interact;
        parameters: {
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
        } & Exclude<PostEventParameters, 'include_image' | 'include_video'>;
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

export interface Safary {
    track<T extends EventId>(event: {
        eventType: T;
        eventName: string;
        parameters: Events[T]['parameters'];
    }): Promise<void>;
}
