import { PlusIcon } from '@heroicons/react/24/outline';

import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialPlatform } from '@/constants/enum.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';

interface ProfileAvatarAddProps extends React.HTMLAttributes<HTMLDivElement> {
    source: SocialPlatform;
    size?: number;
}

export function ProfileAvatarAdd(props: ProfileAvatarAddProps) {
    const { source, size = 40, ...divProps } = props;

    const isLarge = useIsLarge();

    return (
        <div className="relative mx-auto h-[36px] w-[36px] cursor-pointer lg:m-0 lg:h-[40px] lg:w-[48px]" {...divProps}>
            <div className="absolute left-0 top-0 h-[36px] w-[36px] rounded-full shadow backdrop-blur-lg lg:h-[40px] lg:w-[40px]">
                <SourceIcon source={source} size={isLarge ? 40 : 36} />
            </div>
            <PlusIcon
                className="absolute left-[24px] top-[20px] rounded-full bg-white text-black shadow lg:left-[32px] lg:top-[24px]"
                width={16}
                height={16}
            />
        </div>
    );
}
