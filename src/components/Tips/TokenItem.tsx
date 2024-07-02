import { multipliedBy } from '@masknet/web3-shared-base';

import { ClickableButton } from '@/components/ClickableButton.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { classNames } from '@/helpers/classNames.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import type { TipsToken } from '@/types/token.js';

interface TokenItemProps {
    token: TipsToken;
}

export function TokenItem({ token }: TokenItemProps) {
    const { token: selectedToken, update } = TipsContext.useContainer();

    const handleSelectToken = (token: TipsToken) => {
        update((prev) => ({ ...prev, token, amount: token.id !== selectedToken?.id ? '' : prev.amount }));
        router.navigate({ to: TipsRoutePath.TIPS, replace: true });
    };

    const usdtValue = +multipliedBy(token.price, token.amount).toFixed(2);

    return (
        <ClickableButton
            key={token.id}
            className={classNames(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 font-bold text-lightMain hover:bg-lightBg',
                token.id === selectedToken?.id ? 'opacity-50' : '',
            )}
            onClick={() => handleSelectToken(token)}
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
