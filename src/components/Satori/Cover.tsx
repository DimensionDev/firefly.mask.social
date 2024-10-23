import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { AmountProgressText } from '@/components/Satori/AmountProgressText.js';
import { AuthorText } from '@/components/Satori/AuthorText.js';
import { ClaimProgressText } from '@/components/Satori/ClaimProgressText.js';
import { CoverContainer } from '@/components/Satori/CoverContainer.js';
import { MessageText } from '@/components/Satori/MessageText.js';
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
