import { Source } from '@/constants/enum.js';
import type {
    Channel as FireflyChannel,
    ChannelBrief,
    ChannelProfile,
    ChannelProfileBrief,
} from '@/providers/types/Firefly.js';
import { type Channel, type Profile, ProfileStatus } from '@/providers/types/SocialMedia.js';

export function formatChannelProfileFromFirefly(channelProfile: ChannelProfile): Profile {
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
        verified: !!channelProfile.verifications && channelProfile.verifications.length > 0,
        viewerContext: {
            following: channelProfile.isFollowing ?? false,
            followedBy: channelProfile.isFollowedBack ?? false,
        },
        source: Source.Farcaster,
    };
}

export function formatChannelFromFirefly(channel: FireflyChannel): Channel {
    const formatted: Channel = {
        source: Source.Farcaster,
        id: channel.id,
        name: channel.name,
        description: channel.description,
        imageUrl: channel.image_url,
        url: channel.url,
        parentUrl: channel.parent_url,
        followerCount: channel.follower_count ?? 0,
        timestamp: channel.created_at * 1000,
        __original__: channel,
    };
    if (channel.lead) {
        formatted.lead = formatChannelProfileFromFirefly(channel.lead);
    }
    if (channel.hosts?.length) {
        formatted.hosts = channel.hosts.map(formatChannelProfileFromFirefly);
    }
    return formatted;
}

export function formatBriefChannelProfileFromFirefly(channelProfile: ChannelProfileBrief): Profile {
    return {
        status: ProfileStatus.Active,
        verified: true,
        profileId: `${channelProfile.fid}`,
        displayName: channelProfile.display_name,
        handle: channelProfile.username,
        fullHandle: channelProfile.username,
        pfp: channelProfile.pfp,
        bio: channelProfile.bio,
        followerCount: channelProfile.followers,
        followingCount: channelProfile.following,
        viewerContext: {
            following: channelProfile.isFollowing,
            followedBy: channelProfile.isFollowedBack,
        },
        source: Source.Farcaster,
    };
}

export function formatBriefChannelFromFirefly(channel: ChannelBrief, blocked?: boolean): Channel {
    const formatted: Channel = {
        source: Source.Farcaster,
        id: channel.id,
        name: channel.name,
        description: channel.description,
        url: channel.url,
        parentUrl: channel.parent_url,
        imageUrl: channel.image_url,
        followerCount: channel.follower_count ?? 0,
        timestamp: channel.created_at * 1000,
        __original__: channel,
        blocked,
    };

    if (channel.lead) {
        formatted.lead = formatBriefChannelProfileFromFirefly(channel.lead);
    }
    return formatted;
}
