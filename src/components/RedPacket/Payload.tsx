/* eslint-disable @next/next/no-img-element */

import urlcat from 'urlcat';

import { AmountText } from '@/components/RedPacket/AmountText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { FireflyVsFireflyBranding } from '@/components/RedPacket/FireflyVsFireflyBranding.js';
import { PayloadContainer } from '@/components/RedPacket/PayloadContainer.js';
import { QuoteText } from '@/components/RedPacket/QuoteText.js';
import { SITE_URL } from '@/constants/index.js';
import { CoBrandType, Theme, TokenType, UsageType } from '@/types/rp.js';

interface PayloadProps {
    theme: Theme;
    amount: string; // bigint in str
    coBrand: CoBrandType;
    from?: string;
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
}

function PayloadForMask() {
    return (
        <PayloadContainer theme={Theme.Mask}>
            <p>&nbsp;</p>
        </PayloadContainer>
    );
}

function PayloadForFirefly({ amount, token, theme, from }: PayloadProps) {
    return (
        <PayloadContainer theme={theme}>
            {theme === Theme.LuckyFirefly ? (
                <img
                    style={{ position: 'absolute', top: 100 }}
                    src={urlcat(SITE_URL, '/rp/logo-firefly.png')}
                    width={200}
                    height={265}
                    alt="Firefly"
                />
            ) : (
                <img
                    style={{ position: 'absolute', top: 50 }}
                    src={urlcat(SITE_URL, '/rp/golden-flower.png')}
                    width={350}
                    height={350}
                    alt="Golden Flower"
                />
            )}

            <AuthorText theme={theme} usage={UsageType.Payload} from={from} />

            <AmountText amount={amount} token={token} theme={theme} />

            <QuoteText />
        </PayloadContainer>
    );
}

function PayloadForCoBranding({ amount, token, from }: PayloadProps) {
    return (
        <PayloadContainer
            theme={Theme.CoBranding}
            ContainerStyle={{
                color: '#dbcca1',
            }}
        >
            <FireflyVsFireflyBranding />

            <AuthorText theme={Theme.CoBranding} usage={UsageType.Payload} from={from} />

            <AmountText amount={amount} token={token} theme={Theme.CoBranding} />

            <QuoteText />
        </PayloadContainer>
    );
}

export function RedPacketPayload(props: PayloadProps) {
    switch (props.theme) {
        case Theme.Mask:
            return <PayloadForMask />;
        case Theme.GoldenFlower:
        case Theme.LuckyFirefly:
        case Theme.LuckyFlower:
            return <PayloadForFirefly {...props} />;
        case Theme.CoBranding:
            return <PayloadForCoBranding {...props} />;
        default:
            return null;
    }
}
