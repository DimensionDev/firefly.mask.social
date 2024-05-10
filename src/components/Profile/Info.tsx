import { plural, Trans } from '@lingui/macro';

import { UnmuteButton } from '@/components/Actions/UnmuteButton.js';
import { Avatar } from '@/components/Avatar.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { ProfileMoreAction } from '@/components/Profile/ProfileMoreAction.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getLargetTwitterAvatar } from '@/helpers/getLargetTwitterAvatar.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface InfoProps {
    isMyProfile: boolean;
    profile?: Profile;
    source: SocialSource;
}

export function Info({ isMyProfile, profile, source }: InfoProps) {
    const followingCount = profile?.followingCount ?? 0;
    const followerCount = profile?.followerCount ?? 0;

    const isMedium = useIsMedium();

    return (
        <div className="flex gap-3 p-3">
            {profile?.pfp ? (
                <Avatar
                    src={source === Source.Twitter ? getLargetTwitterAvatar(profile.pfp) : profile.pfp}
                    alt="avatar"
                    size={80}
                    className=" h-20 w-20 rounded-full"
                />
            ) : (
                <SocialSourceIcon className="rounded-full" source={source} size={80} />
            )}

            <div className=" relative flex flex-1 flex-col gap-[6px]">
                <div className=" flex flex-col">
                    <div className=" flex items-center gap-2">
                        <span className=" text-xl font-black text-lightMain">{profile?.displayName}</span>
                        <SocialSourceIcon source={source} size={20} />
                        {!isMyProfile && profile && isMedium ? (
                            <>
                                <div className="ml-auto ">
                                    {profile.viewerContext?.blocking ? (
                                        <UnmuteButton profile={profile} />
                                    ) : (
                                        <FollowButton profile={profile} />
                                    )}
                                </div>
                                <ProfileMoreAction profile={profile} />
                            </>
                        ) : null}
                    </div>
                    <span className="text-[15px] text-secondary">@{profile?.handle}</span>
                </div>

                <BioMarkup className="text-[15px]" source={profile?.source}>
                    {profile?.bio ?? '-'}
                </BioMarkup>

                <div className="flex gap-3 text-[15px]">
                    <Link
                        href={{
                            pathname: `/profile/${profile?.profileId}/following`,
                            query: { source: resolveSourceInURL(source) },
                        }}
                        className={classNames('gap-1 hover:underline', {
                            'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                        })}
                    >
                        <span className=" font-bold text-lightMain">{nFormatter(followingCount)} </span>
                        <span className=" text-secondary">
                            <Trans>Following</Trans>
                        </span>
                    </Link>

                    <Link
                        href={{
                            pathname: `/profile/${profile?.profileId}/followers`,
                            query: { source: resolveSourceInURL(source) },
                        }}
                        className={classNames('gap-1 hover:underline', {
                            'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                        })}
                    >
                        <span className=" font-bold text-lightMain">{nFormatter(followerCount)} </span>
                        <span className=" text-secondary">
                            {plural(followerCount, {
                                zero: 'Follower',
                                one: 'Follower',
                                other: 'Followers',
                            })}
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
