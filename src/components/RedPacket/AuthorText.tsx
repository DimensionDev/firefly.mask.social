import { formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm';

import { Theme, UsageType } from '@/types/rp.js';

interface AuthorTextProps {
    theme: Theme;
    usage: UsageType;
    from?: string;
    ContainerStyle?: React.CSSProperties;
}

export function AuthorText({ theme, usage, from = 'unknown', ...props }: AuthorTextProps) {
    const authorText = `From ${isValidAddress(from) ? formatEthereumAddress(from, 4) : from}`;

    switch (usage) {
        case UsageType.Cover:
            return (
                <div style={{ position: 'absolute', right: 40, bottom: 40, ...props.ContainerStyle }}>{authorText}</div>
            );
        case UsageType.Payload:
            return (
                <div
                    style={{
                        fontWeight: 700,
                        textShadow: theme === Theme.CoBranding ? '0 0 0 transparent' : '0 4px 4px rgba(0, 0, 0, 0.25)',
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
                            fontSize: 55,
                            color:
                                theme === Theme.GoldenFlower
                                    ? '#000'
                                    : theme === Theme.CoBranding
                                      ? '#dbcca1'
                                      : '#f1d590',
                        }}
                    >
                        From
                    </div>
                    <div
                        style={{
                            fontSize: 80,
                            color:
                                theme === Theme.GoldenFlower
                                    ? '#000'
                                    : theme === Theme.CoBranding
                                      ? '#dbcca1'
                                      : '#f1d590',
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
