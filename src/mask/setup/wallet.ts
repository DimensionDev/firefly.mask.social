import { ChainId as EVMChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';

import { AsyncStatus } from '@/constants/enum.js';
import { createConstantSubscription } from '@/helpers/subscription.js';
import { initWallet, type WalletAPI } from '@/mask/bindings/index.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

const WalletIO: WalletAPI.IOContext = {
    EVM: {
        chainId: createConstantSubscription(EVMChainId.Mainnet),
        account: createConstantSubscription('0x66b57885E8E9D84742faBda0cE6E3496055b012d'),
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
