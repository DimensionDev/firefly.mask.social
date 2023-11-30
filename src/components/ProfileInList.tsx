import { useDarkMode } from 'usehooks-ts';

import FollowButton from '@/app/profile/components/FollowButton.js';
import { Image } from '@/components/Image.js';
import { getSocialPlatformIconBySource } from '@/helpers/getSocialPlatformIconBySource.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    profile: Profile;
    noFollowButton?: boolean;
}

export function ProfileInList(props: ProfileInListProps) {
    const { profile } = props;

    const { isDarkMode } = useDarkMode();
    const sourceIcon = getSocialPlatformIconBySource(profile.source, isDarkMode);

    return (
        <div className="flex items-center space-x-3">
            <Image
                loading="lazy"
                className="h-[75px] w-[75px] rounded-full border"
                src={profile.pfp}
                fallback={!isDarkMode ? '/image/firefly-light-avatar.png' : '/image/firefly-dark-avatar.png'}
                width={40}
                height={40}
                alt={profile.displayName}
            />

            <div className="flex max-w-sm items-center">
                <div className="flex items-center space-x-2">
                    <span className="block text-sm font-bold leading-5">
                        <span>{profile.displayName}</span>
                        {sourceIcon ? <Image src={sourceIcon} width={16} height={16} alt={profile.source} /> : null}
                    </span>
                    <span className="text-sm leading-6 text-secondary">@{profile.displayName}</span>
                    {profile.bio ? <span className="text-sm">{profile.bio}</span> : null}
                </div>

                {props.noFollowButton ? (
                    <div>
                        <FollowButton isMyProfile={false} profile={profile} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
