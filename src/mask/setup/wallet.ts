import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';

import { config } from '@/configs/wagmiClient.js';
import { AsyncStatus } from '@/constants/enum.js';
import { createConstantSubscription, SubscriptionDebug } from '@/helpers/subscription.js';
import { initWallet, type WalletAPI } from '@/mask/bindings/index.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { getAccount, getChainId } from 'wagmi/actions';

const WalletIO: WalletAPI.IOContext = {
    EVM: {
        chainId: SubscriptionDebug({
            getCurrentValue: () => getChainId(config),
            subscribe: (sub) => config.subscribe((s) => s, sub),
        }),
        account: SubscriptionDebug({
            getCurrentValue: () => getAccount(config).address ?? '',
            subscribe: (sub) => config.subscribe((s) => s, sub),
        }),
    },
    Solana: {
        chainId: createConstantSubscription(SolanaChainId.Mainnet),
        account: createConstantSubscription(''),
    },
};

try {
    await initWallet(WalletIO);
} catch (error) {
    console.error('[mask] Failed to initialize wallet', error);
} finally {
    useGlobalState.getState().setWeb3StateAsyncStatus(AsyncStatus.Idle);
}
