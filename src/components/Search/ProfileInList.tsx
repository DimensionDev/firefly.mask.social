import { Avatar } from '@/components/Avatar.js';
import FollowButton from '@/components/Profile/FollowButton.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useIsSmall } from '@/hooks/useMediaQuery.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
}

export function ProfileInList({ profile, noFollowButton }: ProfileInListProps) {
    const isSmall = useIsSmall('max');

    return (
        <div
            className={`
          flex-start flex cursor-pointer overflow-auto border-b border-secondaryLine px-4 py-6

          hover:bg-bg

          dark:border-line
        `}
        >
            <Link className="flex-start flex flex-1 overflow-auto" href={getProfileUrl(profile)}>
                <Avatar
                    className="mr-3 shrink-0 rounded-full border"
                    src={profile.pfp}
                    size={isSmall ? 40 : 78}
                    alt={profile.displayName}
                />

                <div className="flex-start flex flex-1 flex-col overflow-auto">
                    <p
                        className={`
                      flex-start flex items-center text-sm font-bold leading-5

                      md:mt-2
                    `}
                    >
                        <span className="mr-2 text-xl">{profile.displayName}</span>
                        <SourceIcon source={profile.source} />
                    </p>
                    {profile.handle ? <p className="text-sm text-secondary">@{profile.handle}</p> : null}
                    {profile.bio ? (
                        <p
                            className={`
                              mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm
                            `}
                            title={profile.bio}
                        >
                            {profile.bio}
                        </p>
                    ) : null}
                </div>
            </Link>

            {!noFollowButton ? (
                <div>
                    <FollowButton profile={profile} />
                </div>
            ) : null}
        </div>
    );
}
