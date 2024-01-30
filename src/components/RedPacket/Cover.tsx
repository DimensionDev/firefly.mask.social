/* eslint-disable @next/next/no-img-element */

import urlcat from 'urlcat';

import { AmountProgressText } from '@/components/RedPacket/AmountProgressText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { ClaimProgressText } from '@/components/RedPacket/ClaimProgressText.js';
import { CoverContainer } from '@/components/RedPacket/CoverContainer.js';
import { FireflyVsFireflyBranding } from '@/components/RedPacket/FireflyVsFireflyBranding.js';
import { MessageText } from '@/components/RedPacket/MessageText.js';
import { SITE_URL } from '@/constants/index.js';
import { Theme, TokenType, UsageType } from '@/types/rp.js';

interface CoverProps {
    message: string;
    from: string;
    shares: number;
    remainingShares: number;
    amount: string; // bigint in str
    remainingAmount: string; // bigint in str
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
}

function CoverForMask({ shares, remainingShares = 0, message, from }: CoverProps) {
    return (
        <CoverContainer
            theme={Theme.Mask}
            ContainerStyle={{
                color: '#fff',
            }}
        >
            <MessageText message={message} ContainerStyle={{ fontSize: 60, fontWeight: 700, width: 625, left: 40 }} />

            <ClaimProgressText shares={shares} remainingShares={remainingShares} />

            <AuthorText theme={Theme.Mask} usage={UsageType.Cover} from={from} />
        </CoverContainer>
    );
}

function CoverForFirefly({
    theme,
    shares,
    remainingShares = 0,
    amount,
    remainingAmount,
    message,
    from,
    token,
}: CoverProps & { theme: Theme }) {
    return (
        <CoverContainer
            theme={theme}
            ContainerStyle={{
                color: '#000',
            }}
        >
            {theme === Theme.CoBranding ? <FireflyVsFireflyBranding /> : null}

            {theme === Theme.LuckyFirefly ? (
                <img
                    style={{ position: 'absolute', top: 80 }}
                    src={urlcat(SITE_URL, '/rp/logo-firefly.svg')}
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

            <MessageText message={message} ContainerStyle={{ top: 520 }} />

            <AmountProgressText amount={amount} remainingAmount={remainingAmount} token={token} />

            <ClaimProgressText
                shares={shares}
                remainingShares={remainingShares}
                ContainerStyle={{ left: 60, bottom: 37.5 }}
            />

            <AuthorText
                theme={theme}
                usage={UsageType.Cover}
                from={from}
                ContainerStyle={{
                    right: 60,
                    bottom: 37.5,
                    fontWeight: theme === Theme.GoldenFlower ? 400 : 700,
                    color: theme === Theme.GoldenFlower ? '#000' : '#f1d590',
                }}
            />
        </CoverContainer>
    );
}

function CoverForCoBranding({
    shares,
    remainingShares = 0,
    amount,
    remainingAmount,
    message,
    from,
    token,
}: CoverProps) {
    return (
        <CoverContainer theme={Theme.CoBranding}>
            <FireflyVsFireflyBranding />

            <MessageText message={message} ContainerStyle={{ color: '#dbcca1', top: 520 }} />

            <AmountProgressText
                amount={amount}
                remainingAmount={remainingAmount}
                token={token}
                ContainerStyle={{ color: '#dbcca1' }}
            />

            <ClaimProgressText
                shares={shares}
                remainingShares={remainingShares}
                ContainerStyle={{ color: '#dbcca1', left: 60, bottom: 37.5 }}
            />

            <AuthorText
                theme={Theme.CoBranding}
                usage={UsageType.Cover}
                from={from}
                ContainerStyle={{
                    color: '#dbcca1',
                    right: 60,
                    bottom: 37.5,
                }}
            />
        </CoverContainer>
    );
}

export function RedPacketCover({ theme, ...props }: CoverProps & { theme: Theme }) {
    switch (theme) {
        case Theme.Mask:
            return <CoverForMask {...props} />;
        case Theme.GoldenFlower:
        case Theme.LuckyFlower:
        case Theme.LuckyFirefly:
            return <CoverForFirefly {...props} theme={theme} />;
        case Theme.CoBranding:
            return <CoverForCoBranding {...props} />;
        default:
            return null;
    }
}
