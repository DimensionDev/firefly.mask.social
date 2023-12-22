import { useMediaQuery } from 'usehooks-ts';

import PlusIcon from '@/assets/plus.svg';
import { SourceIcon } from '@/components/SourceIcon.js';
import type { SocialPlatform } from '@/constants/enum.js';

interface ProfileAvatarAddProps extends React.HTMLAttributes<HTMLDivElement> {
    source: SocialPlatform;
    size?: number;
}

export function ProfileAvatarAdd(props: ProfileAvatarAddProps) {
    const { source, size = 40, ...divProps } = props;

    const isLarge = useMediaQuery('(min-width: 1265px)');

    return (
        <div
            className="relative cursor-pointer md:mx-auto  md:h-[36px] md:w-[36px] lg:m-0 lg:h-[40px] lg:w-[48px]"
            {...divProps}
        >
            <div className="absolute left-0 top-0 rounded-full shadow backdrop-blur-lg  md:h-[36px] md:w-[36px] lg:h-[40px] lg:w-[40px]">
                <SourceIcon source={source} size={isLarge ? 40 : 36} />
            </div>
            <PlusIcon
                className="absolute rounded-[99px] shadow md:left-[24px] md:top-[20px] lg:left-[32px] lg:top-[24px]"
                width={16}
                height={16}
            />
        </div>
    );
}
