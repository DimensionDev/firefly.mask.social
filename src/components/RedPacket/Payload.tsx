import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { AmountText } from '@/components/RedPacket/AmountText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { PayloadContainer } from '@/components/RedPacket/PayloadContainer.js';
import { QuoteText } from '@/components/RedPacket/QuoteText.js';
import { CoBrandType, TokenType, UsageType } from '@/types/rp.js';

interface PayloadProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
    amount: string; // bigint in str
    coBrand: CoBrandType;
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

            <QuoteText />
        </PayloadContainer>
    );
}
