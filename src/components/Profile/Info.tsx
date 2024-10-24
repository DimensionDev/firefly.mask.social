import { plural, Trans } from '@lingui/macro';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Avatar } from '@/components/Avatar.js';
import { AvatarGroup } from '@/components/AvatarGroup.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { ProfileAction } from '@/components/Profile/ProfileAction.js';
import { ProfileVerifyBadge } from '@/components/ProfileVerifyBadge/index.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { TextOverflowTooltip } from '@/components/TextOverflowTooltip.js';
import { FollowCategory, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getLargeTwitterAvatar } from '@/helpers/getLargeTwitterAvatar.js';
import { isSameProfile } from '@/helpers/isSameProfile.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
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
    const showAction = !!profile;

    return (
        <div className="grid grid-cols-[80px_calc(100%-80px-12px)] gap-3 p-3">
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

            <div className="relative flex w-full flex-col">
                <div className="flex w-full flex-col">
                    <div className="flex w-full items-center gap-2">
                        <SocialSourceIcon className="shrink-0" source={source} size={20} />
                        <TextOverflowTooltip content={profile.displayName} placement="top">
                            <address className="truncate text-xl font-black not-italic text-lightMain">
                                {profile.displayName}
                            </address>
                        </TextOverflowTooltip>
                        <ProfileVerifyBadge className="flex flex-shrink-0 items-center space-x-1" profile={profile} />
                        <div className="ml-auto flex items-center gap-2">
                            {showAction ? <ProfileAction profile={profile} /> : null}
                        </div>
                    </div>
                    <span className="text-medium text-secondary">@{profile.handle}</span>
                </div>

                <BioMarkup className="break-word text-medium" source={profile.source}>
                    {profile.bio ?? '-'}
                </BioMarkup>

                <div className="flex gap-3 text-medium leading-[22px]">
                    <Link
                        href={resolveProfileUrl(source, profileId, FollowCategory.Following)}
                        className={classNames('gap-1 hover:underline', {
                            'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                        })}
                    >
                        <data value={followingCount}>
                            <span className="font-bold text-lightMain">{nFormatter(followingCount)} </span>
                            <span className="text-secondary">
                                <Trans>Following</Trans>
                            </span>
                        </data>
                    </Link>

                    <Link
                        href={resolveProfileUrl(source, profileId, FollowCategory.Followers)}
                        className={classNames('gap-1 hover:underline', {
                            'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                        })}
                    >
                        <data value={followerCount}>
                            <span className="font-bold text-lightMain">{nFormatter(followerCount)} </span>
                            <span className="text-secondary">
                                {plural(followerCount, {
                                    one: 'Follower',
                                    other: 'Followers',
                                })}
                            </span>
                        </data>
                    </Link>
                </div>
            </div>
            {enabledMutuals && mutualCount ? (
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
                                Followed by {mutuals[0].displayName} , {mutuals[1].displayName}, and{' '}
                                {mutuals[2].displayName}
                            </Trans>
                        ) : (
                            <Trans>
                                Followed by {mutuals[0].displayName} , {mutuals[1].displayName}, and {mutualCount - 2}{' '}
                                others you follow
                            </Trans>
                        )}
                    </Link>
                </div>
            ) : null}
        </div>
    );
}
