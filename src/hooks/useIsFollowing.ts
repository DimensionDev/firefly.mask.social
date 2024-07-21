import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { Source } from '@/constants/enum.js';
import { safeUnreachable } from '@/helpers/controlFlow.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Options {
    profile: Profile;
    /** We get following state lazy, will fallback to placeholder before the fetching happens */
    placeholder: boolean;
    /** Control the lazy fetching */
    enabled: boolean;
}

export function useIsFollowing({ profile, placeholder, enabled }: Options) {
    const platform = profile.source;
    const identifier = platform === Source.Lens ? profile.handle : profile.profileId;
    const { data: isFollowing, refetch } = useQuery({
        enabled,
        queryKey: ['profile', 'is-following', platform, identifier],
        queryFn: () => {
            switch (platform) {
                case Source.Lens:
                    return LensSocialMediaProvider.getProfileByHandle(identifier);
                case Source.Farcaster:
                    return FarcasterSocialMediaProvider.getProfileById(identifier);
                case Source.Twitter:
                    return TwitterSocialMediaProvider.getProfileById(identifier);
                default:
                    safeUnreachable(platform);
                    return null;
            }
        },
        select(data) {
            return data?.viewerContext?.following;
        },
    });
    const refresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    return [isFollowing ?? placeholder, refresh] as const;
}
