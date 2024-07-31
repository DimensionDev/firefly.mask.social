import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { formatEthereumAddress } from '@/helpers/formatEthereumAddress.js';
import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import { UsageType } from '@/types/rp.js';

interface AuthorTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    usage: UsageType;
    from?: string;
    ContainerStyle?: React.CSSProperties;
}

export function AuthorText({ theme, usage, from = 'unknown', ...props }: AuthorTextProps) {
    const authorText = `From ${formatEthereumAddress(from, 4)}`;

    switch (usage) {
        case UsageType.Cover:
            return (
                <div
                    style={{
                        ...getCSSPropertiesFromThemeSettings(theme.normal.title3),
                        position: 'absolute',
                        right: 40,
                        bottom: 40,
                        ...props.ContainerStyle,
                    }}
                >
                    {authorText}
                </div>
            );
        case UsageType.Payload:
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'absolute',
                        top: 440,
                        ...props.ContainerStyle,
                    }}
                >
                    <div style={getCSSPropertiesFromThemeSettings(theme.cover.title1)}>From</div>
                    <div style={getCSSPropertiesFromThemeSettings(theme.cover.title2)}>
                        {formatEthereumAddress(from, 4)}
                    </div>
                </div>
            );
        default:
            return null;
    }
}
