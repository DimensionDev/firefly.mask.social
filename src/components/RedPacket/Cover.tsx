/* eslint-disable @next/next/no-img-element */

import urlcat from 'urlcat';

import { AmountProgressText } from '@/components/RedPacket/AmountProgressText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { ClaimProgressText } from '@/components/RedPacket/ClaimProgressText.js';
import { CornerMark } from '@/components/RedPacket/CornerMark.js';
import { CoverContainer } from '@/components/RedPacket/CoverContainer.js';
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

function CoverForMask({ shares, remainingShares = 0, message, from, token }: CoverProps) {
    return (
        <CoverContainer
            theme={Theme.Mask}
            ContainerStyle={{
                color: '#fff',
            }}
        >
            <CornerMark type={token.type} />

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
            <CornerMark type={token.type} />

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
            <CornerMark type={token.type} />

            {/* left logos */}
            <img
                style={{ position: 'absolute', top: 170, left: 0, opacity: 0.1 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 170, left: 61.5, opacity: 0.2 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 170, left: 61.5 * 2, opacity: 0.3 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 170, left: 61.5 * 3, opacity: 0.6 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />

            {/* right logos */}
            <img
                style={{ position: 'absolute', top: 170, right: 185 - 61.5 * 3, opacity: 0.1 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 170, right: 185 - 61.5 * 2, opacity: 0.2 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 170, right: 185 - 61.5, opacity: 0.3 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />
            <img
                style={{ position: 'absolute', top: 170, right: 185, opacity: 0.6 }}
                src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')}
                alt="Firefly"
                width={190}
                height={250}
            />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    top: 170,
                    position: 'absolute',
                }}
            >
                <img src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')} alt="Firefly" width={190} height={250} />
                <img
                    style={{ marginLeft: 132, marginRight: 132 }}
                    src={urlcat(SITE_URL, '/rp/x.png')}
                    alt="X"
                    width={60}
                    height={60}
                />
                <img src={urlcat(SITE_URL, '/rp/logo-firefly-lighter.png')} alt="Firefly" width={190} height={250} />
            </div>

            <MessageText message={message} ContainerStyle={{ top: 520 }} />

            <AmountProgressText amount={amount} remainingAmount={remainingAmount} token={token} />

            <ClaimProgressText
                shares={shares}
                remainingShares={remainingShares}
                ContainerStyle={{ left: 60, bottom: 37.5 }}
            />

            <AuthorText
                theme={Theme.CoBranding}
                usage={UsageType.Cover}
                from={from}
                ContainerStyle={{
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
