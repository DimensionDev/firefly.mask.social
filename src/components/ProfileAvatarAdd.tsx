import PlusIcon from '@/assets/plus.svg';
import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialPlatform } from '@/constants/enum.js';

interface ProfileAvatarAddProps extends React.HTMLAttributes<HTMLDivElement> {
    source: SocialPlatform;
    size?: number;
}

export function ProfileAvatarAdd(props: ProfileAvatarAddProps) {
    const { source, size = 40, ...divProps } = props;
    return (
        <div className=" relative h-[40px] w-[48px] cursor-pointer" {...divProps}>
            <div className="absolute left-0 top-0 h-[40px] w-[40px] rounded-[99px] shadow backdrop-blur-lg">
                <SourceIcon source={source} size={40} />
            </div>
            <PlusIcon className="absolute left-[32px] top-[24px] rounded-[99px] shadow" width={16} height={16} />
        </div>
    );
}
