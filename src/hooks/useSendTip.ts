import { NetworkPluginID } from '@masknet/shared-base';
import { useWeb3Connection } from '@masknet/web3-hooks-base';
import { rightShift } from '@masknet/web3-shared-base';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { TipsContext } from '@/hooks/useTipsContext.js';

export function useSendTip(): [boolean, () => Promise<string | undefined>] {
    const { token, amount, receiver } = TipsContext.useContainer();
    const account = useAccount();
    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, {
        account: account.address,
        chainId: token?.chainId ?? undefined,
    });

    const [{ loading: isTransferring }, sendTip] = useAsyncFn(async () => {
        if (!token?.id || !receiver?.address) return;
        const totalAmount = rightShift(amount, token.decimals).toFixed();
        return Web3.transferFungibleToken(token.id, receiver.address, totalAmount, '');
    }, [account, token?.id, token?.decimals, amount, Web3, receiver?.address]);

    return [isTransferring, sendTip];
}
