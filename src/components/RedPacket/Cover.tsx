/* eslint-disable @next/next/no-img-element */

import { formatBalance, minus } from '@masknet/web3-shared-base';
import urlcat from 'urlcat';

import { SITE_URL } from '@/constants/index.js';
import { Theme } from '@/types/rp.js';

const COVER_PRESETS: Record<Theme, { backgroundImage?: string; backgroundColor?: string }> = {
    [Theme.Mask]: {
        backgroundImage: urlcat(SITE_URL, '/rp/mask-background.png'),
    },
    [Theme.CoBranding]: {
        backgroundImage: urlcat(SITE_URL, '/rp/co-branding-background.png'),
        backgroundColor: '#f7413d',
    },
    [Theme.GoldenFlower]: {
        backgroundColor: '#ffc37c',
    },
    [Theme.LuckyFlower]: {
        backgroundColor: '#ec5a3d',
    },
    [Theme.LuckyFirefly]: {
        backgroundColor: '#ec5a3d',
    },
};

interface RedPacketCoverProps {
    shares: number;
    remainingShares: number;
    amount: string; // bigint in str
    remainingAmount: string; // bigint in str
    symbol: string;
    decimals: number;
    message: string;
    from: string;
}

function RedPacketCoverForMask({ shares, remainingShares = 0, message, from }: RedPacketCoverProps) {
    const preset = COVER_PRESETS[Theme.Mask];

    const claimProgressText = `Claimed ${shares - remainingShares} / ${shares}`;
    const authorText = `From: @${from}`;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                backgroundSize: '100% 100%',
                backgroundImage: preset.backgroundImage ? `url("${preset.backgroundImage}")` : 'none',
                backgroundColor: preset.backgroundColor ?? 'transparent',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div style={{ fontSize: 60, fontWeight: 700, width: 625, position: 'absolute', left: 40 }}>{message}</div>
            <div style={{ position: 'absolute', left: 40, bottom: 40 }}>{claimProgressText}</div>
            <div style={{ position: 'absolute', right: 40, bottom: 40 }}>{authorText}</div>
        </div>
    );
}

function RedPacketCoverForFirefly({
    theme,
    shares,
    remainingShares = 0,
    amount,
    remainingAmount,
    symbol,
    decimals,
    message = 'Best Wishes!',
    from,
}: RedPacketCoverProps & { theme: Theme }) {
    const preset = COVER_PRESETS[theme];

    const claimedAmountText = formatBalance(minus(amount, remainingAmount), decimals, {
        isFixed: true,
        significant: 0,
        fixedDecimals: 0,
    });
    const totalAmountText = formatBalance(amount, decimals, {
        isFixed: true,
        significant: 0,
        fixedDecimals: 0,
    });
    const claimProgressText = `${shares - remainingShares} of ${shares} Claimed`;
    const authorText = `From ${from}`;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: 30,
                fontWeight: 400,
                fontFamily: 'Inter',
                backgroundColor: preset.backgroundColor ?? 'transparent',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {theme === Theme.LuckyFirefly ? (
                <img
                    style={{ position: 'absolute', top: 80 }}
                    src={urlcat(SITE_URL, '/rp/logo-firefly.png')}
                    alt="Hero Image"
                    width={255}
                    height={340}
                />
            ) : (
                <img
                    style={{ position: 'absolute', top: 80 }}
                    src={urlcat(SITE_URL, '/rp/golden-flower.png')}
                    alt="Hero Image"
                    width={430}
                    height={430}
                />
            )}

            <div style={{ fontSize: 50, fontWeight: 400, position: 'absolute', top: 520 }}>{message}</div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    top: 608,
                    position: 'absolute',
                }}
            >
                <div style={{ fontSize: 70, fontWeight: 700 }}>{claimedAmountText}</div>
                <div style={{ fontSize: 45, fontWeight: 700, marginLeft: 8 }}>{symbol}</div>
                <div style={{ fontSize: 70, fontWeight: 700, marginLeft: 8 }}>/</div>
                <div style={{ fontSize: 70, fontWeight: 700, marginLeft: 8 }}>{totalAmountText}</div>
                <div style={{ fontSize: 45, fontWeight: 700, marginLeft: 8 }}>{symbol}</div>
            </div>

            <div style={{ position: 'absolute', left: 60, bottom: 37.5 }}>{claimProgressText}</div>
            <div
                style={{
                    position: 'absolute',
                    right: 60,
                    bottom: 37.5,
                    fontWeight: theme === Theme.GoldenFlower ? 400 : 700,
                    color: theme === Theme.GoldenFlower ? '#000' : '#f1d590',
                }}
            >
                {authorText}
            </div>
        </div>
    );
}

export function RedPacketCover({ theme, ...props }: RedPacketCoverProps & { theme: Theme }) {
    switch (theme) {
        case Theme.Mask:
            return <RedPacketCoverForMask {...props} />;
        case Theme.GoldenFlower:
        case Theme.LuckyFlower:
        case Theme.LuckyFirefly:
            return <RedPacketCoverForFirefly {...props} theme={theme} />;
        default:
            return null;
    }
}
