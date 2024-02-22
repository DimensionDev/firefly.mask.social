import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { formatBalance, isZero, minus } from '@masknet/web3-shared-base';

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
                alignItems: 'flex-end',
                top: 608,
                position: 'absolute',
                ...props.ContainerStyle,
            }}
        >
            {!isZero(claimedAmountText) ? (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <div
                        style={{
                            color: theme.normal.title2.color,
                            fontSize: theme.normal.title2.font_size,
                            fontWeight: theme.normal.title2.font_weight,
                            lineHeight: `${theme.normal.title2.line_height}`,
                            ...props.AmountTextStyle,
                        }}
                    >
                        {claimedAmountText}
                    </div>
                    <div
                        style={{
                            color: theme.normal.title_symbol.color,
                            fontSize: theme.normal.title_symbol.font_size,
                            fontWeight: theme.normal.title_symbol.font_weight,
                            lineHeight: `${theme.normal.title_symbol.line_height}`,
                            marginLeft: 8,
                            position: 'relative',
                            top: -6,
                            ...props.SymbolTextStyle,
                        }}
                    >
                        {symbol}
                    </div>
                    <div
                        style={{
                            color: theme.normal.title2.color,
                            fontSize: theme.normal.title2.font_size,
                            fontWeight: theme.normal.title2.font_weight,
                            lineHeight: `${theme.normal.title2.line_height}`,
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
                    color: theme.normal.title2.color,
                    fontSize: theme.normal.title2.font_size,
                    fontWeight: theme.normal.title2.font_weight,
                    lineHeight: `${theme.normal.title2.line_height}`,
                    marginLeft: 8,
                    ...props.AmountTextStyle,
                }}
            >
                {totalAmountText}
            </div>
            <div
                style={{
                    color: theme.normal.title_symbol.color,
                    fontSize: theme.normal.title_symbol.font_size,
                    fontWeight: theme.normal.title_symbol.font_weight,
                    lineHeight: `${theme.normal.title_symbol.line_height}`,
                    marginLeft: 8,
                    position: 'relative',
                    top: -6,
                    ...props.SymbolTextStyle,
                }}
            >
                {symbol}
            </div>
        </div>
    );
}
