import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

interface ClaimProgressTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    shares: number;
    remainingShares: number;
    ContainerStyle?: React.CSSProperties;
}

export function ClaimProgressText({ theme, shares, remainingShares, ...props }: ClaimProgressTextProps) {
    const claimProgressText = `${shares - remainingShares}/${shares} Claims`;

    return (
        <div
            style={{
                ...getCSSPropertiesFromThemeSettings(theme.normal.title3),
                ...props.ContainerStyle,
                fontSize: 22,
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            {claimProgressText}
        </div>
    );
}
