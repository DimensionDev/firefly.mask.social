import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { AmountProgressText } from '@/components/RedPacket/AmountProgressText.js';
import { AuthorText } from '@/components/RedPacket/AuthorText.js';
import { ClaimProgressText } from '@/components/RedPacket/ClaimProgressText.js';
import { CoverContainer } from '@/components/RedPacket/CoverContainer.js';
import { MessageText } from '@/components/RedPacket/MessageText.js';
import { Theme, TokenType, UsageType } from '@/types/rp.js';

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

function CoverForFirefly({
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

export function RedPacketCover(props: CoverProps) {
    return <CoverForFirefly {...props} />;
}
