/* eslint-disable @next/next/no-img-element */

import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { formatBalance } from '@/helpers/formatBalance.js';
import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
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
            <div style={getCSSPropertiesFromThemeSettings(theme.cover.title3)}>{amountText}</div>
            <div
                style={{
                    ...getCSSPropertiesFromThemeSettings(theme.cover.title3),
                    marginLeft: 8,
                }}
            >
                {symbol}
            </div>
        </div>
    );
}
