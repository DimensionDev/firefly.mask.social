import { safeUnreachable } from '@masknet/kit';

import { formatEthereumAddress } from '@/helpers/formatAddress.js';
import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import { UsageType } from '@/types/rp.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

interface AuthorTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    usage: UsageType;
    from?: string;
    ContainerStyle?: React.CSSProperties;
}

export function AuthorText({ theme, usage, from = 'unknown', ...props }: AuthorTextProps) {
    switch (usage) {
        case UsageType.Cover:
            return (
                <div
                    style={{
                        ...getCSSPropertiesFromThemeSettings(theme.normal.title3),
                        ...props.ContainerStyle,
                    }}
                >
                    {`From ${formatEthereumAddress(from, 4)}`}
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
            safeUnreachable(usage);
            return null;
    }
}
