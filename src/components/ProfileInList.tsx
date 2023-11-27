import FollowButton from '@/app/profile/components/FollowButton.jsx';
import { Image } from '@/components/Image.js';
import { useQueryMode } from '@/hooks/useQueryMode.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileInListProps {
    profile: Profile;
}

export function ProfileInList(props: ProfileInListProps) {
    const mode = useQueryMode();

    return (
        <div>
            <div className="flex items-center space-x-3">
                <Image
                    loading="lazy"
                    className="h-[75px] w-[75px] rounded-full border"
                    src={props.profile.pfp}
                    fallback={mode === 'light' ? '/image/firefly-light-avatar.png' : '/image/firefly-dark-avatar.png'}
                    width={40}
                    height={40}
                    alt={props.profile.profileId}
                />

                <div className="flex max-w-sm items-center">
                    <div className="flex items-center space-x-2">
                        <span className="block text-sm font-bold leading-5">{props.profile.displayName}</span>
                        <span className="text-sm leading-6 text-secondary">@{props.profile.displayName}</span>
                        {props.profile.bio ? <span className="text-sm">{props.profile.bio}</span> : null}
                    </div>
                    <div>
                        <FollowButton profile={props.profile} />
                    </div>
                </div>
            </div>
        </div>
    );
}
