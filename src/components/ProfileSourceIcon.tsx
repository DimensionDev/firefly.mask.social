'use client';
import { safeUnreachable } from '@masknet/kit';

import FireflyIcon from '@/assets/firefly.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type ProfileSource, Source } from '@/constants/enum.js';

interface ProfileSourceIcon extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: ProfileSource;
}

export function ProfileSourceIcon({ source, size = 20, ...props }: ProfileSourceIcon) {
    const style = {
        width: size,
        height: size,
        ...props.style,
    };

    switch (source) {
        case Source.Lens:
        case Source.Farcaster:
        case Source.Twitter:
            return <SocialSourceIcon {...props} source={source} style={style} width={size} height={size} />;
        case Source.Firefly:
            return <FireflyIcon {...props} style={style} width={size} height={size} />;
        default:
            safeUnreachable(source);
            return null;
    }
}
