'use client';

import { Trans } from '@lingui/macro';
import { useInfiniteQuery } from '@tanstack/react-query';

import { AvatarGroup } from '@/components/AvatarGroup.js';
import { Link } from '@/components/Link.js';
import { FollowCategory } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function Mutuals({ profile }: { profile: Profile }) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const myProfile = useCurrentProfile(currentSocialSource);
    const myProfileId = myProfile?.profileId;

    const enabledMutuals = !isSameProfile(myProfile, profile);
    const profileId = profile.profileId;
    const source = profile.source;

    // Fetch the first page with useInfiniteQuery, the same as
    // MutualFollowersList, to make it reuseable in MutualFollowersList
    const { data: mutuals } = useInfiniteQuery({
        enabled: enabledMutuals,
        queryKey: ['profiles', source, 'mutual-followers', myProfileId, profileId],
        queryFn: async () => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getMutualFollowers(profile.profileId);
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? EMPTY_LIST),
    });
    const mutualCount = mutuals?.length;

    return enabledMutuals && mutualCount ? (
        <div className="break-word col-[1/3] mt-3 flex items-center gap-2 leading-[22px] hover:underline sm:col-[2/3]">
            <AvatarGroup profiles={mutuals.slice(0, 3)} AvatarProps={{ size: 30 }} />
            <Link
                className="text-sm text-secondary"
                href={resolveProfileUrl(source, profileId, FollowCategory.Mutuals)}
            >
                {mutualCount === 1 ? (
                    <Trans>Followed by {mutuals[0].displayName}</Trans>
                ) : mutualCount === 2 ? (
                    <Trans>
                        Followed by {mutuals[0].displayName} and {mutuals[1].displayName}
                    </Trans>
                ) : mutualCount === 3 ? (
                    <Trans>
                        Followed by {mutuals[0].displayName} , {mutuals[1].displayName}, and {mutuals[2].displayName}
                    </Trans>
                ) : (
                    <Trans>
                        Followed by {mutuals[0].displayName} , {mutuals[1].displayName}, and {mutualCount - 2} others
                        you follow
                    </Trans>
                )}
            </Link>
        </div>
    ) : null;
}
