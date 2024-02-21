import { AmountText } from '@/components/RedPacket/AmountText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { FireflyVsFireflyBranding } from '@/components/RedPacket/FireflyVsFireflyBranding.js';
import { PayloadContainer } from '@/components/RedPacket/PayloadContainer.js';
import { QuoteText } from '@/components/RedPacket/QuoteText.js';
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
            <AuthorText theme={theme} usage={UsageType.Payload} from={from} />

            <AmountText amount={amount} token={token} theme={theme} />

            <QuoteText />
        </PayloadContainer>
    );
}

function PayloadForCoBranding({ amount, token, from }: PayloadProps) {
    return (
        <PayloadContainer
            theme={Theme.FireflyCoBranding}
            ContainerStyle={{
                color: '#dbcca1',
            }}
        >
            <FireflyVsFireflyBranding />

            <AuthorText theme={Theme.FireflyCoBranding} usage={UsageType.Payload} from={from} />

            <AmountText amount={amount} token={token} theme={Theme.FireflyCoBranding} />

            <QuoteText />
        </PayloadContainer>
    );
}

export function RedPacketPayload(props: PayloadProps) {
    switch (props.theme) {
        case Theme.Mask:
            return <PayloadForMask />;
        case Theme.Firefly:
            return <PayloadForFirefly {...props} />;
        case Theme.FireflyCoBranding:
            return <PayloadForCoBranding {...props} />;
        default:
            return null;
    }
}
