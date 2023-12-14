import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileNameProps {
    profile: Profile;
}

export function ProfileName(props: ProfileNameProps) {
    const { profile } = props;
    return (
        <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
            <div className=" text-sm font-medium text-main">{profile.displayName}</div>
            <div className=" text-sm font-normal text-second">@{profile.handle}</div>
        </div>
    );
}
