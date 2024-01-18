import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { Theme } from '@/types/rp.js';

const COVER_PRESETS: Record<Theme, { backgroundImage?: string; backgroundColor?: string }> = {
    [Theme.Mask]: {
        backgroundImage: urlcat(SITE_URL, '/rp/mask-background.png'),
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

interface RedPacketCoverProps {
    amount: number;
    remaining?: number;
    message?: string;
    from?: string;
}

function RedPacketCoverForMask({ amount, remaining = 0, message = 'Best Wishes!', from }: RedPacketCoverProps) {
    const preset = COVER_PRESETS[Theme.Mask];

    const claimProgressText = `Claimed ${amount - remaining} / ${amount}`;
    const authorText = `From: ${from ? `@${from}` : 'unknown'}`;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                backgroundSize: '100% 100%',
                backgroundImage: preset.backgroundImage ? `url("${preset.backgroundImage}")` : 'none',
                backgroundColor: preset.backgroundColor ?? 'transparent',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div style={{ fontSize: 60, fontWeight: 700, width: 625, position: 'absolute', left: 40 }}>{message}</div>
            <div style={{ position: 'absolute', left: 40, bottom: 40 }}>{claimProgressText}</div>
            <div style={{ position: 'absolute', right: 40, bottom: 40 }}>{authorText}</div>
        </div>
    );
}

export function RedPacketCover({ theme, ...props }: RedPacketCoverProps & { theme: Theme }) {
    switch (theme) {
        case Theme.Mask:
            return <RedPacketCoverForMask {...props} />;
        default:
            return null;
    }
}
