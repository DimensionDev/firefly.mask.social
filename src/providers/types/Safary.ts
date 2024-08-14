import { EventType } from '@/providers/types/Telemetry.js';

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
    include_image: 'Y' | 'N';
    include_video: 'Y' | 'N';
    is_scheduled: 'Y' | 'N';
    scheduled_id?: string;
    include_Lucky_drop: 'Y' | 'N';
    lucky_drop_id?: string;
    include_poll: 'Y' | 'N';
    poll_id?: string;
}

export interface Events {
    send_cross_post_success: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            include_lens_post?: 'Y' | 'N';
            lens_post_id?: string;
            lens_id?: string;
            lens_handle?: string;
            include_farcaster_cast?: 'Y' | 'N';
            farcaster_cast_id?: string;
            farcaster_id?: string;
            farcaster_handle?: string;
            include_x_post?: 'Y' | 'N';
            x_post_id?: string;
            x_id?: string;
            x_handle?: string;
            is_scheduled: 'Y' | 'N';
            scheduled_id?: string;
            include_lucky_drop: 'Y' | 'N';
            lucky_drop_id?: string;
            include_poll: 'Y' | 'N';
            poll_Id?: string;
        };
    };
    create_scheduled_post: {
        type: EventType.Interact;
        parameters: {
            firefly_account_id: string;
            include_lens_post?: 'Y' | 'N';
            lens_post_id?: string;
            lens_id?: string;
            lens_handle?: string;
            include_farcaster_cast?: 'Y' | 'N';
            farcaster_cast_id?: string;
            farcaster_id?: string;
            farcaster_handle?: string;
            include_x_post?: 'Y' | 'N';
            x_post_id?: string;
            x_id?: string;
            x_handle?: string;
            scheduled_time_utc: string; // mm-dd-yyyy hh:mm:ss(GMT+0)
        };
    };
    send_tips_success: {
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
    create_lucky_drop_success: {
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
    create_poll_success: {
        type: EventType.Interact;
        parameters: {
            poll_id: string;
            firefly_account_id: string;
        };
    };
    farcaster_send_post_success: {
        type: EventType.Interact;
        parameters: {
            farcaster_cast_id: string;
            farcaster_id: string;
            farcaster_handle: string;
        } & PostEventParameters;
    };
    farcaster_like_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    farcaster_reply_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    farcaster_recast_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    farcaster_quote_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    farcaster_share_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    farcaster_follow_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    farcaster_bookmark_success: {
        type: EventType.Interact;
        parameters: FarcasterEventParameters;
    };
    lens_send_post_success: {
        type: EventType.Interact;
        parameters: {
            lens_post_id: string;
            lens_handle: string;
        } & PostEventParameters;
    };
    lens_like_success: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    lens_mirror_success: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    lens_quote_success: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    lens_share_success: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    lens_follow_success: {
        type: EventType.Interact;
        parameters: Omit<LensEventParameters, 'target_lens_post_id'>;
    };
    lens_bookmark_success: {
        type: EventType.Interact;
        parameters: LensEventParameters;
    };
    x_send_post_success: {
        type: EventType.Interact;
        parameters: {
            x_post_id: string;
            x_id: string;
            x_handle: string;
        } & PostEventParameters;
    };
    x_reply_success: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    x_like_success: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    x_quote_success: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    x_repost_success: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    x_share_success: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
    x_follow_success: {
        type: EventType.Interact;
        parameters: Omit<TwitterEventParameters, 'target_x_post_id'>;
    };
    x_bookmark_success: {
        type: EventType.Interact;
        parameters: TwitterEventParameters;
    };
}

export interface Safary {
    track(event: keyof Events, parameters: Events[keyof Events]['parameters']): void;
}
