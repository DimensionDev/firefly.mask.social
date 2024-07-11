import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { formatBalance } from '@/helpers/formatBalance.js';
import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import { isZero, minus } from '@/helpers/number.js';
import type { TokenType } from '@/types/rp.js';

interface AmountProgressTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    amount: string; // bigint in str
    remainingAmount: string; // bigint in str
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
    ContainerStyle?: React.CSSProperties;
    AmountTextStyle?: React.CSSProperties;
    SymbolTextStyle?: React.CSSProperties;
}

export function AmountProgressText({ theme, amount, remainingAmount, token, ...props }: AmountProgressTextProps) {
    const { symbol, decimals = 0 } = token;

    const claimedAmountText = formatBalance(minus(amount, remainingAmount), decimals, {
        isFixed: true,
        significant: 6,
        fixedDecimals: 6,
    });
    const totalAmountText = formatBalance(amount, decimals, {
        isFixed: true,
        significant: 6,
        fixedDecimals: 6,
    });

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                top: 608,
                width: '100%',
                position: 'absolute',
                paddingLeft: 60,
                paddingRight: 60,
                overflow: 'hidden',
                maxHeight: 160,
                ...props.ContainerStyle,
            }}
        >
            {!isZero(claimedAmountText) ? (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <div
                            style={{
                                ...getCSSPropertiesFromThemeSettings(theme.normal.title2),
                                ...props.AmountTextStyle,
                            }}
                        >
                            {claimedAmountText}
                        </div>
                        <div
                            style={{
                                ...getCSSPropertiesFromThemeSettings(theme.normal.title_symbol),
                                marginLeft: 8,
                                position: 'relative',
                                top: -6,
                                ...props.SymbolTextStyle,
                            }}
                        >
                            {symbol}
                        </div>
                    </div>
                    <div
                        style={{
                            ...getCSSPropertiesFromThemeSettings(theme.normal.title2),
                            marginLeft: 8,
                            ...props.AmountTextStyle,
                        }}
                    >
                        /
                    </div>
                </div>
            ) : null}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    whiteSpace: 'nowrap',
                }}
            >
                <div
                    style={{
                        ...getCSSPropertiesFromThemeSettings(theme.normal.title2),
                        marginLeft: 8,
                        ...props.AmountTextStyle,
                    }}
                >
                    {totalAmountText}
                </div>
                <div
                    style={{
                        ...getCSSPropertiesFromThemeSettings(theme.normal.title_symbol),
                        marginLeft: 8,
                        position: 'relative',
                        top: -6,
                        ...props.SymbolTextStyle,
                    }}
                >
                    {symbol}
                </div>
            </div>
        </div>
    );
}
