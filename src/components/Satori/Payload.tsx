import { AmountText } from '@/components/Satori/AmountText.js';
import { AuthorText } from '@/components/Satori/AuthorText.js';
import { PayloadContainer } from '@/components/Satori/PayloadContainer.js';
import { QuoteText } from '@/components/Satori/QuoteText.js';
import { TokenType, UsageType } from '@/types/rp.js';
import type { ThemeGroupSettings } from '@/providers/types/RedPacket.js';

interface PayloadProps {
    theme: ThemeGroupSettings;
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
