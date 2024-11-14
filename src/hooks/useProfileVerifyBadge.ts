import { useQuery } from '@tanstack/react-query';

import { Source } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useProfileVerifyBadge(profile?: Profile) {
    return useQuery({
        queryKey: ['profile-badge', profile?.handle, profile?.source],
        queryFn: async () => {
            if (!profile) return [];
            const provider = resolveSocialMediaProvider(profile.source);
            return provider.getProfileBadges(profile);
        },
        enabled: profile && [Source.Twitter, Source.Farcaster].includes(profile.source),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
