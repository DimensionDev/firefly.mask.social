import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm';

import { UsageType } from '@/types/rp.js';

interface AuthorTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    usage: UsageType;
    from?: string;
    ContainerStyle?: React.CSSProperties;
}

export function AuthorText({ theme, usage, from = 'unknown', ...props }: AuthorTextProps) {
    const authorText = `From ${isValidAddress(from) ? formatEthereumAddress(from, 4) : from}`;

    switch (usage) {
        case UsageType.Cover:
            return (
                <div
                    style={{
                        fontSize: theme.normal.title1.font_size,
                        fontWeight: theme.normal.title1.font_weight,
                        color: theme.normal.title1.color,
                        lineHeight: `${theme.normal.title1.line_height}px`,
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
                    <div
                        style={{
                            fontSize: theme.cover.title1.font_size,
                            fontWeight: theme.cover.title1.font_weight,
                            color: theme.cover.title1.color,
                            lineHeight: `${theme.cover.title1.line_height}px`,
                        }}
                    >
                        From
                    </div>
                    <div
                        style={{
                            fontSize: theme.cover.title2.font_size,
                            fontWeight: theme.cover.title2.font_weight,
                            color: theme.cover.title2.color,
                            lineHeight: `${theme.cover.title2.line_height}px`,
                        }}
                    >
                        {isValidAddress(from) ? formatEthereumAddress(from, 4) : from}
                    </div>
                </div>
            );
        default:
            return null;
    }
}
