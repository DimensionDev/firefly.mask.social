import { ClickableButton } from '@/components/ClickableButton.js';
import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { multipliedBy } from '@/helpers/number.js';
import type { Token } from '@/providers/types/Transfer.js';

interface TokenItemProps {
    token: Token;
}

export function TokenItem({ token }: TokenItemProps) {
    const usdtValue = +multipliedBy(token.price, token.amount).toFixed(2);

    return (
        <ClickableButton
            key={token.id}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-bold text-lightMain"
            enablePropagate
        >
            <div className="flex items-center gap-x-2.5">
                <TokenIcon token={token} />
                <div className="text-left">
                    <span>{token.name}</span>
                    <br />
                    <span className="text-[13px] text-lightSecond">{`${token.balance} ${token.symbol}`}</span>
                </div>
            </div>
            <span>{Number.isNaN(usdtValue) ? '' : `$${usdtValue}`}</span>
        </ClickableButton>
    );
}
