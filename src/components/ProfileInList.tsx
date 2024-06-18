import { isUndefined } from 'lodash-es';

import { Avatar } from '@/components/Avatar.js';
import { FollowButton } from '@/components/Profile/FollowButton.js';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { isMyProfile } from '@/helpers/isMyProfile.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
    listKey?: string;
    index?: number;
}

export function ProfileInList({ profile, noFollowButton, listKey, index }: ProfileInListProps) {
    const isSmall = useIsSmall('max');

    const setScrollIndex = useGlobalState.use.setScrollIndex();

    return (
        <div className="flex-start flex cursor-pointer overflow-auto border-b border-secondaryLine px-4 py-6 hover:bg-bg dark:border-line">
            <Link
                onClick={() => {
                    if (listKey && !isUndefined(index)) setScrollIndex(listKey, index);
                }}
                className="flex-start flex flex-1 overflow-auto"
                href={getProfileUrl(profile)}
            >
                <Avatar
                    className="mr-3 shrink-0 rounded-full border"
                    src={profile.pfp}
                    size={isSmall ? 40 : 44}
                    alt={profile.displayName}
                />

                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <p className="flex-start flex items-center text-sm font-bold leading-5">
                        <span className="overflow-hide mr-2 text-ellipsis whitespace-nowrap text-xl">
                            {profile.displayName}
                        </span>
                        <SocialSourceIcon className="shrink-0" source={profile.source} />
                    </p>
                    {profile.handle ? <p className="text-sm text-secondary">@{profile.handle}</p> : null}
                    {profile.bio ? (
                        <p
                            className="mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                            title={profile.bio}
                        >
                            {profile.bio}
                        </p>
                    ) : null}
                </div>
            </Link>

            <div className="ml-2 w-[100px]">
                {!noFollowButton && !isMyProfile(profile) ? <FollowButton profile={profile} /> : null}
            </div>
        </div>
    );
}
