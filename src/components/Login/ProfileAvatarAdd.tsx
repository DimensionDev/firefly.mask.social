import { PlusIcon } from '@heroicons/react/24/outline';

import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import type { SocialSource } from '@/constants/enum.js';
import { useIsLarge } from '@/hooks/useMediaQuery.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface ProfileAvatarAddProps extends React.HTMLAttributes<HTMLDivElement> {
    source: SocialSource;
}

export function ProfileAvatarAdd({ source, ...props }: ProfileAvatarAddProps) {
    const isLarge = useIsLarge();

    const size = isLarge ? 40 : 36;
    const style = useSizeStyle(size, props.style);

    return (
        <div className="relative z-0 cursor-pointer md:mx-auto lg:m-0" style={style} {...props}>
            <div className="absolute left-0 top-0 rounded-full" style={style}>
                <SocialSourceIcon source={source} size={size} />
            </div>
            <PlusIcon
                className="absolute -bottom-[1px] -right-[8px] rounded-full bg-white text-black lg:left-8 lg:top-6"
                width={16}
                height={16}
            />
        </div>
    );
}
