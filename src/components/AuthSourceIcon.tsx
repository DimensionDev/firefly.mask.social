import { safeUnreachable } from '@masknet/kit';
import type { SVGProps } from 'react';

import AppleIcon from '@/assets/apple.svg';
import GoogleIcon from '@/assets/google.svg';
import TelegramIcon from '@/assets/telegram.svg';
import { AuthSource } from '@/constants/enum.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface AuthSourceIconProps extends SVGProps<SVGSVGElement> {
    size?: number;
    source: AuthSource;
}

export function AuthSourceIcon({ source, size = 20, ...props }: AuthSourceIconProps) {
    const style = useSizeStyle(size, props.style);

    switch (source) {
        case AuthSource.Google:
            return <GoogleIcon {...props} style={style} width={size} height={size} />;
        case AuthSource.Apple:
            return <AppleIcon {...props} style={style} width={size} height={size} />;
        case AuthSource.Telegram:
            return <TelegramIcon {...props} style={style} width={size} height={size} />;
        default:
            safeUnreachable(source);
            return null;
    }
}
