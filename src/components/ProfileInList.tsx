import { Plural } from '@lingui/macro';
import { isUndefined } from 'lodash-es';

import { Avatar } from '@/components/Avatar.js';
import { BioMarkup } from '@/components/Markup/BioMarkup.js';
import { PlainParagraph, VoidLineBreak } from '@/components/Markup/overrides.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { FollowCategory, Source } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { classNames } from '@/helpers/classNames.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isCurrentProfile } from '@/helpers/isCurrentProfile.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
    listKey?: string;
    index?: number;
}

const overrideComponents = {
    p: PlainParagraph,
    br: VoidLineBreak,
};
export function ProfileInList({ profile, noFollowButton, listKey, index }: ProfileInListProps) {
    const isMedium = useIsMedium('max');

    const setScrollIndex = useGlobalState.use.setScrollIndex();

    const handleClickOnLink = () => {
        if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
    };

    const profileUrl = getProfileUrl(profile);

    const { source, profileId } = profile;
    const followerCount = profile.followerCount || 0;

    return (
        <div className="flex-start flex gap-3 overflow-auto border-b border-secondaryLine p-3 hover:bg-bg dark:border-line">
            <Link onClick={handleClickOnLink} className="shrink-0" href={profileUrl}>
                <Avatar
                    className="rounded-full border"
                    src={profile.pfp}
                    size={isMedium ? 40 : 44}
                    alt={profile.displayName}
                />
            </Link>
            <div className="min-w-0 flex-grow">
                <div className="flex-start flex gap-3">
                    <div className="flex-start flex flex-1 flex-col overflow-auto">
                        <p className="flex items-center gap-2 text-sm font-bold leading-5">
                            <Link className="truncate text-lg leading-6" href={profileUrl}>
                                {profile.displayName}
                            </Link>
                            <SocialSourceIcon
                                mono
                                className="shrink-0 text-secondary"
                                size={16}
                                source={profile.source}
                            />
                        </p>
                        <div className="flex items-center">
                            {profile.handle ? (
                                <Link
                                    className="self-start text-[15px] leading-[22px] text-secondary"
                                    href={profileUrl}
                                    onClick={handleClickOnLink}
                                >
                                    @{profile.handle}
                                </Link>
                            ) : null}
                            <span className="mx-1 leading-[22px] text-secondary">·</span>
                            <Link
                                href={resolveProfileUrl(source, profileId, FollowCategory.Followers)}
                                className={classNames('gap-1 text-[15px] leading-[22px] hover:underline', {
                                    'pointer-events-none': source !== Source.Farcaster && source !== Source.Lens,
                                })}
                            >
                                <data value={followerCount}>
                                    <span className="font-bold leading-[22px] text-lightMain">
                                        {nFormatter(followerCount)}{' '}
                                    </span>
                                    <span className="leading-[22px] text-secondary">
                                        <Plural value={followerCount} one="Follower" other="Followers" />
                                    </span>
                                </data>
                            </Link>
                        </div>
                    </div>
                    {!noFollowButton && !isCurrentProfile(profile) ? (
                        <FollowButton
                            profile={profile}
                            variant={isMedium ? 'icon' : 'text'}
                            className={isMedium ? 'w-[50px] max-w-[50px]' : 'w-[88px] !min-w-0 max-w-[88px]'}
                        />
                    ) : null}
                </div>
                {profile.bio ? (
                    <Link href={profileUrl} onClick={handleClickOnLink}>
                        <BioMarkup
                            className="mt-1.5 truncate text-sm"
                            components={overrideComponents}
                            source={profile.source}
                        >
                            {profile.bio}
                        </BioMarkup>
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
