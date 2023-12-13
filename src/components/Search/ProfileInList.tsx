import { Avatar } from '@/components/Avatar.js';
import { PlatformIcon } from '@/components/PlatformIcon.js';
import FollowButton from '@/components/Profile/FollowButton.js';
import { Link } from '@/esm/Link.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
}

export function ProfileInList({ profile, noFollowButton }: ProfileInListProps) {
    return (
        <div className="flex-start flex cursor-pointer border-b border-secondaryLine px-4 py-6 hover:bg-bg dark:border-line">
            <Link className="flex-start flex flex-1" href={getProfileUrl(profile)}>
                <Avatar
                    className="mr-3 h-[78px] w-[78px] rounded-full border"
                    src={profile.pfp}
                    size={78}
                    alt={profile.displayName}
                />

                <div className="flex-start flex flex-1 flex-col">
                    <span className="flex-start mt-2 flex items-center text-sm font-bold leading-5">
                        <span className="mr-2 text-xl">{profile.displayName}</span>
                        <PlatformIcon source={profile.source} />
                    </span>
                    {profile.handle ? <span className="text-sm text-secondary">@{profile.handle}</span> : null}
                    {profile.bio ? <span className="mt-1.5 line-clamp-1 text-sm">{profile.bio}</span> : null}
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
