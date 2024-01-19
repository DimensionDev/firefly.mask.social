/* eslint-disable @next/next/no-img-element */

import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { Theme } from '@/types/rp.js';

const PAYLOAD_PRESETS: Record<Theme, { backgroundImage?: string; backgroundColor?: string }> = {
    [Theme.Mask]: {
        backgroundImage: urlcat(SITE_URL, '/rp/payload-2023.png'),
    },
    [Theme.CoBranding]: {
        backgroundImage: urlcat(SITE_URL, '/rp/co-branding-background.png'),
        backgroundColor: '#f7413d',
    },
    [Theme.GoldenFlower]: {
        backgroundColor: '#ffc37c',
    },
    [Theme.LuckyFlower]: {
        backgroundColor: '#ec5a3d',
    },
    [Theme.LuckyFirefly]: {
        backgroundColor: '#ec5a3d',
    },
};

interface PayloadContainerProps {
    theme: Theme;
    children: React.ReactNode;
    ContainerStyle?: React.CSSProperties;
}

export function PayloadContainer({ theme, children, ...props }: PayloadContainerProps) {
    const preset = PAYLOAD_PRESETS[theme];

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                backgroundSize: '100% 100%',
                backgroundImage: preset.backgroundImage ? `url("${preset.backgroundImage}")` : '',
                backgroundColor: preset.backgroundColor ?? 'transparent',
                backgroundRepeat: 'no-repeat',
                borderRadius: 45,
                ...props.ContainerStyle,
            }}
        >
            {children}
        </div>
    );
}
