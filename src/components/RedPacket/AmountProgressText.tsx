import { formatBalance, isZero, minus } from '@masknet/web3-shared-base';
import { Fragment } from 'react';

import type { TokenType } from '@/types/rp.js';

interface AmountProgressTextProps {
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

export function AmountProgressText({ amount, remainingAmount, token, ...props }: AmountProgressTextProps) {
    const { symbol, decimals = 0 } = token;

    const claimedAmountText = formatBalance(minus(amount, remainingAmount), decimals, {
        isFixed: false,
        isPrecise: false,
        significant: 0,
        fixedDecimals: 0,
    });
    const totalAmountText = formatBalance(amount, decimals, {
        isFixed: false,
        isPrecise: false,
        significant: 0,
        fixedDecimals: 0,
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
                    <div style={{ fontSize: 70, fontWeight: 700, ...props.AmountTextStyle }}>{claimedAmountText}</div>
                    <div
                        style={{
                            fontSize: 45,
                            fontWeight: 700,
                            marginLeft: 8,
                            position: 'relative',
                            top: -6,
                            ...props.SymbolTextStyle,
                        }}
                    >
                        {symbol}
                    </div>
                    <div style={{ fontSize: 70, fontWeight: 700, marginLeft: 8, ...props.AmountTextStyle }}>/</div>
                </div>
            ) : null}
            <div style={{ fontSize: 70, fontWeight: 700, marginLeft: 8, ...props.AmountTextStyle }}>
                {totalAmountText}
            </div>
            <div
                style={{
                    fontSize: 45,
                    fontWeight: 700,
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
