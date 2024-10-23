import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';

interface ClaimProgressTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    shares: number;
    remainingShares: number;
    ContainerStyle?: React.CSSProperties;
}

export function ClaimProgressText({ theme, shares, remainingShares, ...props }: ClaimProgressTextProps) {
    const claimProgressText = `${shares - remainingShares} of ${shares} Claimed`;

    return (
        <div
            style={{
                ...getCSSPropertiesFromThemeSettings(theme.normal.title3),
                position: 'absolute',
                left: 40,
                bottom: 40,
                ...props.ContainerStyle,
            }}
        >
            {claimProgressText}
        </div>
    );
}
