import { AmountProgressText } from '@/components/RedPacket/AmountProgressText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { ClaimProgressText } from '@/components/RedPacket/ClaimProgressText.js';
import { CoverContainer } from '@/components/RedPacket/CoverContainer.js';
import { MessageText } from '@/components/RedPacket/MessageText.js';
import type { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
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
            theme={theme}
            ContainerStyle={{
                color: '#000',
            }}
        >
            <MessageText theme={theme} message={message} ContainerStyle={{ top: 520 }} />

            <AmountProgressText theme={theme} amount={amount} remainingAmount={remainingAmount} token={token} />

            <ClaimProgressText
                theme={theme}
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
                }}
            />
        </CoverContainer>
    );
}
