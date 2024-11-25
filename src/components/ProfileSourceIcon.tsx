'use client';
import { safeUnreachable } from '@masknet/kit';
import type { SVGProps } from 'react';

import AppleIcon from '@/assets/apple.svg';
import GoogleIcon from '@/assets/google.svg';
import FireflyIcon from '@/assets/logo.svg';
import TelegramIcon from '@/assets/telegram.svg';
import { SocialSourceIcon } from '@/components/SocialSourceIcon.js';
import { type ProfileSource, Source } from '@/constants/enum.js';
import { useSizeStyle } from '@/hooks/useSizeStyle.js';

interface ProfileSourceIcon extends SVGProps<SVGSVGElement> {
    size?: number;
    source: ProfileSource;
}

export function ProfileSourceIcon({ source, size = 20, ...props }: ProfileSourceIcon) {
    const style = useSizeStyle(size, props.style);

    switch (source) {
        case Source.Lens:
        case Source.Farcaster:
        case Source.Twitter:
            return <SocialSourceIcon {...props} source={source} style={style} width={size} height={size} />;
        case Source.Firefly:
            return (
                <FireflyIcon
                    {...props}
                    style={{
                        ...style,
                        overflow: 'visible',
                    }}
                    width={size}
                    height={size}
                />
            );
        case Source.Google:
            return <GoogleIcon {...props} style={style} width={size} height={size} />;
        case Source.Apple:
            return <AppleIcon {...props} style={style} width={size} height={size} />;
        case Source.Telegram:
            return <TelegramIcon {...props} style={style} width={size} height={size} />;
        default:
            safeUnreachable(source);
            return null;
    }
}
