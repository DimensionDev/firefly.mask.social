import { AmountText } from '@/components/RedPacket/AmountText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { PayloadContainer } from '@/components/RedPacket/PayloadContainer.js';
import { QuoteText } from '@/components/RedPacket/QuoteText.js';
import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';
import { TokenType, UsageType } from '@/types/rp.js';

interface PayloadProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    amount: string; // bigint in str
    from?: string;
    token: {
        type: TokenType;
        symbol: string;
        decimals?: number;
    };
}

export function RedPacketPayload({ amount, token, theme, from }: PayloadProps) {
    return (
        <PayloadContainer theme={theme}>
            <AuthorText theme={theme} usage={UsageType.Payload} from={from} />

            <AmountText amount={amount} token={token} theme={theme} />

            <QuoteText theme={theme} />
        </PayloadContainer>
    );
}
