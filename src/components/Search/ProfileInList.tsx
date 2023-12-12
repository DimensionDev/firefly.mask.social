import { Image } from '@/components/Image.js';
import FollowButton from '@/components/Profile/FollowButton.js';
import { SourceIcon } from '@/components/SourceIcon.js';
import { SocialPlatform } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
}

export function ProfileInList(props: ProfileInListProps) {
    const { profile } = props;

    const { isDarkMode } = useDarkMode();
    const isLens = profile.source === SocialPlatform.Lens;
    const handle = isLens ? profile.handle : profile.nickname;

    return (
        <div className="flex-start flex cursor-pointer border-b border-secondaryLine px-4 py-6 hover:bg-bg dark:border-line">
            <Link className="flex-start flex flex-1" href={`/profile/${handle}`}>
                <Image
                    loading="lazy"
                    className="mr-3 h-[78px] w-[78px] rounded-full border"
                    src={profile.pfp}
                    fallback={!isDarkMode ? '/image/firefly-light-avatar.png' : '/image/firefly-dark-avatar.png'}
                    width={78}
                    height={78}
                    alt={profile.displayName}
                />

                <div className="flex-start flex flex-1 flex-col">
                    <span className="flex-start mt-2 flex items-center text-sm font-bold leading-5">
                        <span className="mr-2 text-xl">{profile.displayName}</span>
                        <SourceIcon source={profile.source} />
                    </span>
                    {handle ? <span className="text-sm text-secondary">@{handle}</span> : null}
                    {profile.bio ? <span className="mt-1.5 line-clamp-1 text-sm">{profile.bio}</span> : null}
                </div>
            </Link>

            {!props.noFollowButton ? (
                <div>
                    <FollowButton profile={profile} />
                </div>
            ) : null}
        </div>
    );
}
