import type { ProfileStatus } from '@/providers/types/SocialMedia.js';

export interface Profile {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
        bio: {
            text: string;
            mentioned_profiles: string[];
        };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
    };
    active_status: ProfileStatus;
    power_badge: boolean;
}
