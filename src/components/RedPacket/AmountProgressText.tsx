import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import { hexToRGBA } from '@/helpers/hexToRGBA.js';
import { minus, rightShift } from '@/helpers/number.js';
import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';
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

    const progress = minus(amount, remainingAmount).div(amount).multipliedBy(100).toNumber();
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',

                border: `1px solid ${getCSSPropertiesFromThemeSettings(theme.normal.title2).color}`,
                borderRadius: 16,
                padding: '12px 22px',
                color: getCSSPropertiesFromThemeSettings(theme.normal.title2).color,
                backgroundColor: hexToRGBA(getCSSPropertiesFromThemeSettings(theme.normal.title2).color, 0.2),
                ...props.ContainerStyle,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: 62,
                    borderRadius: progress === 100 ? 16 : '16px 0 0 16px',
                    backgroundColor: hexToRGBA(getCSSPropertiesFromThemeSettings(theme.normal.title2).color, 0.4),
                    width: `${progress}%`,
                }}
            />
            {nFormatter(rightShift(amount, decimals).toNumber(), 6)}{' '}
            {symbol.length > 6 ? symbol.slice(0, 6) + '...' : symbol}
        </div>
    );
}
