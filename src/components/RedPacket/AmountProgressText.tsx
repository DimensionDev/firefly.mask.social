import { formatBalance } from '@/helpers/formatBalance.js';
import { nFormatter } from '@/helpers/formatCommentCounts.js';
import { formatPrice } from '@/helpers/formatPrice.js';
import { getCSSPropertiesFromThemeSettings } from '@/helpers/getCSSPropertiesFromThemeSettings.js';
import { hexToRGBA } from '@/helpers/hexToRGBA.js';
import { dividedBy, leftShift } from '@/helpers/number.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
import type { TokenType } from '@/types/rp.js';

interface AmountProgressTextProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    amount: string; // bigint in str
    remainingAmount?: string; // bigint in str
    shares?: number;
    remainingShares?: number;
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
    ContainerStyle?: React.CSSProperties;
    AmountTextStyle?: React.CSSProperties;
    SymbolTextStyle?: React.CSSProperties;
}

export function AmountProgressText({
    theme,
    amount,
    remainingAmount,
    token,
    shares,
    remainingShares,
    AmountTextStyle,
    SymbolTextStyle,
    ...props
}: AmountProgressTextProps) {
    const { symbol, decimals = 0 } = token;

    const progress =
        remainingShares !== undefined && shares
            ? dividedBy(shares - remainingShares, shares)
                  .multipliedBy(100)
                  .toNumber()
            : undefined;

    const totalAmountText = formatBalance(amount, decimals, {
        isFixed: true,
        significant: 6,
        fixedDecimals: 6,
    });

    const totalAmount = leftShift(amount, decimals).toNumber();

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
                border: `1px solid ${getCSSPropertiesFromThemeSettings(theme.normal.title2).color}`,
                borderRadius: 16,
                boxSizing: 'border-box',
                padding: '12px 0px',
                color: getCSSPropertiesFromThemeSettings(theme.normal.title2).color,
                backgroundColor: hexToRGBA(getCSSPropertiesFromThemeSettings(theme.normal.title2).color, 0.2),
                ...props.ContainerStyle,
            }}
        >
            {progress !== undefined ? (
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: 62,
                        borderRadius: progress === 100 ? 16 : '16px 0 0 16px',
                        backgroundColor: hexToRGBA(getCSSPropertiesFromThemeSettings(theme.normal.title2).color, 0.4),
                        width: `${progress}%`,
                        ...AmountTextStyle,
                    }}
                />
            ) : null}
            <div
                style={{
                    margin: '0px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    columnGap: '8px',
                    ...SymbolTextStyle,
                }}
            >
                {totalAmount > 1 ? (
                    nFormatter(leftShift(amount, decimals).toNumber())
                ) : totalAmount < 0.0001 ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ShrankPrice shrank={formatPrice(totalAmount) ?? '-'} />
                    </div>
                ) : (
                    totalAmountText
                )}{' '}
                {symbol}
            </div>
        </div>
    );
}

function ShrankPrice({ shrank }: { shrank: string }) {
    if (!shrank.includes('{')) return shrank;
    const parts = shrank.match(/^(.+){(\d+)}(.+)$/);
    if (!parts) return shrank;
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            {parts[1]}
            <sub className="text-[0.66em]" style={{ fontSize: '0.66em' }}>
                {parts[2]}
            </sub>
            {parts[3]}
        </div>
    );
}
