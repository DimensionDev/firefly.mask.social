import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';
import { formatBalance } from '@masknet/web3-shared-base';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { Theme, TokenType } from '@/types/rp.js';

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
                borderTop: theme === Theme.CoBranding ? '4px solid' : '4px solid transparent',
                borderBottom: theme === Theme.CoBranding ? '4px solid' : '4px solid transparent',
            }}
        >
            {theme === Theme.CoBranding ? (
                <img
                    style={{ marginRight: 40, marginTop: 14, marginBottom: 14 }}
                    src={urlcat(SITE_URL, '/rp/stars-left.png')}
                    width={84}
                    height={64}
                    alt="starts"
                />
            ) : null}

            <div style={{ fontSize: 60, fontWeight: theme === Theme.CoBranding ? 400 : 700 }}>{amountText}</div>
            <div style={{ fontSize: 60, fontWeight: theme === Theme.CoBranding ? 400 : 700, marginLeft: 8 }}>
                {symbol}
            </div>

            {theme === Theme.CoBranding ? (
                <img
                    style={{ marginLeft: 40, marginTop: 14, marginBottom: 14 }}
                    src={urlcat(SITE_URL, '/rp/stars-right.png')}
                    width={84}
                    height={64}
                    alt="starts"
                />
            ) : null}
        </div>
    );
}
