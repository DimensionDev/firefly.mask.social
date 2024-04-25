import { SocialPlatform } from '@/constants/enum.js';
import type { Channel as FireflyChannel, ChannelProfile } from '@/providers/types/Firefly.js';
import { type Channel, type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatFarcasterChannelProfileFromFirefly(channelProfile: ChannelProfile): Profile {
    return {
        profileId: `${channelProfile.fid}`,
        displayName: channelProfile.display_name,
        handle: channelProfile.username,
        fullHandle: channelProfile.username,
        pfp: channelProfile.pfp_url,
        bio: channelProfile.profile?.bio?.text,
        address: channelProfile.custody_address,
        followerCount: channelProfile.follower_count,
        followingCount: channelProfile.following_count,
        status: channelProfile.active_status === 'active' ? ProfileStatus.Active : ProfileStatus.Inactive,
        verified: channelProfile.verifications.length > 0,
        source: SocialPlatform.Farcaster,
    };
}

export function formatFarcasterChannelFromFirefly(channel: FireflyChannel): Channel {
    const formatted: Channel = {
        source: SocialPlatform.Farcaster,
        id: channel.id,
        name: channel.name,
        description: channel.description,
        imageUrl: channel.image_url,
        url: channel.url,
        parentUrl: channel.parent_url,
        followerCount: channel.follower_count,
        timestamp: channel.created_at * 1000,
        __original__: channel,
    };
    if (channel.lead) {
        formatted.lead = formatFarcasterChannelProfileFromFirefly(channel.lead);
    }
    if (channel.hosts?.length) {
        formatted.hosts = channel.hosts.map(formatFarcasterChannelProfileFromFirefly);
    }
    return formatted;
}
