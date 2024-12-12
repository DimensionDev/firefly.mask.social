import { AmountProgressText } from '@/components/RedPacket/AmountProgressText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { ClaimProgressText } from '@/components/RedPacket/ClaimProgressText.js';
import { CoverContainer } from '@/components/RedPacket/CoverContainer.js';
import { MessageText } from '@/components/RedPacket/MessageText.js';
import type { FireflyRedPacketAPI } from '@/mask/bindings/index.js';
import { TokenType, UsageType } from '@/types/rp.js';

interface CoverProps {
    theme: FireflyRedPacketAPI.ThemeGroupSettings;
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

export function RedPacketCover({
    theme,
    shares,
    remainingShares = 0,
    amount,
    remainingAmount,
    message,
    from,
    token,
}: CoverProps) {
    return (
        <CoverContainer
            ContainerStyle={{
                color: '#000',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 8 }}>
                <MessageText theme={theme} message={message} />
                <AuthorText theme={theme} usage={UsageType.Cover} from={from} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 8 }}>
                <ClaimProgressText theme={theme} shares={shares} remainingShares={remainingShares} />
                <AmountProgressText theme={theme} amount={amount} remainingAmount={remainingAmount} token={token} />
            </div>
        </CoverContainer>
    );
}
