import { plural, Trans } from '@lingui/macro';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

import { Avatar } from '@/components/Avatar.js';
import { AvatarGroup } from '@/components/AvatarGroup.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { ProfileAction } from '@/components/Profile/ProfileAction.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { FollowCategory, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getLargeTwitterAvatar } from '@/helpers/getLargeTwitterAvatar.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface InfoProps {
    profile: Profile;
}

export function Info({ profile }: InfoProps) {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const myProfile = useCurrentProfile(currentSocialSource);
    const myProfileId = myProfile?.profileId;
    const profileId = profile.profileId;

    const isMedium = useIsMedium();
    const [reached, setReached] = useState(false);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (value) => {
        setReached(value > 60);
    });

    const source = profile.source;
    const enabledMutuals = !isSameProfile(myProfile, profile);
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

    const followingCount = profile.followingCount || 0;
    const followerCount = profile.followerCount || 0;

    return (
        <div className="flex gap-3 p-3">
            {profile.pfp ? (
                <Avatar
                    src={source === Source.Twitter ? getLargeTwitterAvatar(profile.pfp) : profile.pfp}
                    alt="avatar"
                    size={80}
                    className="h-20 w-20 rounded-full"
                />
            ) : (
                <SocialSourceIcon className="rounded-full" source={source} size={80} />
            )}

            <div className="relative flex flex-1 flex-col">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-lightMain">{profile.displayName}</span>
                        <SocialSourceIcon className="mr-auto min-w-5" source={source} size={20} />
                        {profile && !reached ? <ProfileAction profile={profile} /> : null}
                    </div>
                    <span className="text-[15px] text-secondary">@{profile.handle}</span>
                </div>

                <BioMarkup className="text-[15px]" source={profile.source}>
                    {profile.bio ?? '-'}
                </BioMarkup>

                <div className="flex gap-3 text-[15px] leading-[22px]">
                    <Link
                        href={{
                            pathname: `/profile/${profileId}/following`,
                            query: { source: resolveSourceInURL(source) },
                        }}
                        className={classNames('gap-1 hover:underline', {
                            'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                        })}
                    >
                        <span className="font-bold text-lightMain">{nFormatter(followingCount)} </span>
                        <span className="text-secondary">
                            <Trans>Following</Trans>
                        </span>
                    </Link>

                    <Link
                        href={{
                            pathname: `/profile/${profileId}/followers`,
                            query: { source: resolveSourceInURL(source) },
                        }}
                        className={classNames('gap-1 hover:underline', {
                            'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                        })}
                    >
                        <span className="font-bold text-lightMain">{nFormatter(followerCount)} </span>
                        <span className="text-secondary">
                            {plural(followerCount, {
                                one: 'Follower',
                                other: 'Followers',
                            })}
                        </span>
                    </Link>
                </div>
                {enabledMutuals && mutualCount ? (
                    <div className="mt-3 flex items-center gap-2 leading-[22px] hover:underline">
                        <AvatarGroup profiles={mutuals.slice(0, 3)} AvatarProps={{ size: 30 }} />
                        <Link
                            className="text-sm text-secondary"
                            href={{
                                pathname: `/profile/${profileId}/${FollowCategory.Mutuals}`,
                                query: { source: resolveSourceInURL(source) },
                            }}
                        >
                            {mutualCount === 1 ? (
                                <Trans>Followed by {mutuals[0].displayName}</Trans>
                            ) : mutualCount === 2 ? (
                                <Trans>
                                    Followed by {mutuals[0].displayName} and {mutuals[1].displayName}
                                </Trans>
                            ) : mutualCount === 3 ? (
                                <Trans>
                                    Followed by {mutuals[0].displayName} , {mutuals[1].displayName}, and{' '}
                                    {mutuals[2].displayName}
                                </Trans>
                            ) : (
                                <Trans>
                                    Followed by {mutuals[0].displayName} , {mutuals[1].displayName}, and{' '}
                                    {mutualCount - 2} others you follow
                                </Trans>
                            )}
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
