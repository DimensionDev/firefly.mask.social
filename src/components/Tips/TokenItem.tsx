import { multipliedBy } from '@masknet/web3-shared-base';

import { ClickableButton } from '@/components/ClickableButton.js';
import { router, TipsRoutePath } from '@/components/Tips/tipsModalRouter.js';
import { TokenIcon } from '@/components/Tips/TokenIcon.js';
import { NetworkType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { resolveNetworkProvider } from '@/helpers/resolveTokenTransfer.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import type { Token } from '@/providers/types/Transfer.js';

interface TokenItemProps {
    token: Token;
}

export function TokenItem({ token }: TokenItemProps) {
    const { token: selectedToken, receiver, update } = TipsContext.useContainer();

    const handleSelectToken = async (token: Token) => {
        if (receiver?.networkType === NetworkType.Ethereum) {
            const network = resolveNetworkProvider(receiver.networkType);
            if (token.chainId !== network.getChainId()) {
                await network.switchChain(token.chainId);
            }
        }
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
