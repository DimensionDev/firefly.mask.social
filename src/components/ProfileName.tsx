import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileNameProps {
    profile: Profile;
}

export function ProfileName({ profile }: ProfileNameProps) {
    return (
        <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center">
            <div className="text-[16px] font-bold text-main">{profile.displayName}</div>
            <div className="text-[15px] font-normal text-second">@{profile.handle}</div>
        </div>
    );
}
