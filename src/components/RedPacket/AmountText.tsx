/* eslint-disable @next/next/no-img-element */

import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { formatBalance } from '@masknet/web3-shared-base';

import { TokenType } from '@/types/rp.js';

interface AmountTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    amount: string; // bigint in str
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
}

export function AmountText({ amount, token, theme, ...props }: AmountTextProps) {
    const { symbol, decimals = 0 } = token;

    const amountText = formatBalance(amount, decimals, {
        isFixed: true,
        significant: 6,
        fixedDecimals: 6,
    });

    return (
        <div
            style={{
                top: 640,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                position: 'absolute',
            }}
        >
            <div
                style={{
                    color: theme.cover.title3.color,
                    fontSize: theme.cover.title3.font_size,
                    fontWeight: theme.cover.title3.font_weight,
                    lineHeight: `${theme.cover.title3.line_height}px`,
                }}
            >
                {amountText}
            </div>
            <div
                style={{
                    color: theme.cover.title3.color,
                    fontSize: theme.cover.title3.font_size,
                    fontWeight: theme.cover.title3.font_weight,
                    lineHeight: `${theme.cover.title3.line_height}px`,
                    marginLeft: 8,
                }}
            >
                {symbol}
            </div>
        </div>
    );
}
