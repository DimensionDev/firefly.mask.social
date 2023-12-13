import { PlatformIcon } from '@/components/PlatformIcon.js';
import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfileAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    profile: Profile;
    size?: number;
    clickable?: boolean;
}

export function ProfileAvatar(props: ProfileAvatarProps) {
    const { profile, size = 40, clickable = true, ...divProps } = props;
    return (
        <div
            className={classNames(' flex h-[40px] w-[48px] items-start justify-start', {
                'cursor-pointer': clickable,
            })}
            {...divProps}
        >
            <div className="relative h-[40px] w-[40px]">
                <div
                    className={`absolute left-0 top-0 h-[${size}px] w-[${size}px] rounded-[99px] shadow backdrop-blur-lg`}
                >
                    <Image className="rounded-[99px]" src={profile.pfp} alt="avatar" width={size} height={size} />
                </div>
                <PlatformIcon
                    className="absolute left-[24px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                    source={profile.source}
                    size={16}
                />
            </div>
        </div>
    );
}
