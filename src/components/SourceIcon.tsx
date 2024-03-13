import { safeUnreachable } from '@masknet/kit';

import FarcasterIcon from '@/assets/farcaster.svg';
import LensIcon from '@/assets/lens.svg';
import { SocialPlatform } from '@/constants/enum.js';

interface SourceIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    source: SocialPlatform;
}

export function SourceIcon({ source, size = 20, ...props }: SourceIconProps) {
    const style = {
        width: size,
        height: size,
        ...props.style,
    };

    switch (source) {
        case SocialPlatform.Lens:
            return <LensIcon {...props} style={style} width={size} height={size} />;
        case SocialPlatform.Farcaster:
            return <FarcasterIcon {...props} style={style} width={size} height={size} />;
        default:
            safeUnreachable(source);
            return null;
    }
}
