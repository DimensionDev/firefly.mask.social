import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

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
                color: theme.normal.title3.color,
                fontSize: theme.normal.title3.font_size,
                fontWeight: theme.normal.title3.font_weight,
                lineHeight: `${theme.normal.title3.line_height}`,
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
