import { EthereumMethodType, type RequestArguments } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';
import { getAccount, getChainId, sendTransaction, waitForTransactionReceipt } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { AsyncStatus } from '@/constants/enum.js';
import { createConstantSubscription, SubscriptionDebug } from '@/helpers/subscription.js';
import { initWallet, type WalletAPI } from '@/mask/bindings/index.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

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
        request: async <T>(requestArguments: RequestArguments) => {
            const sendRequest = async () => {
                switch (requestArguments.method) {
                    case EthereumMethodType.ETH_SEND_TRANSACTION:
                        const transaction: { chainId: string | number } = requestArguments.params[0];
                        const hash = await sendTransaction(config, {
                            ...transaction,
                            chainId:
                                typeof transaction.chainId === 'string'
                                    ? Number.parseInt(transaction.chainId, 16)
                                    : transaction.chainId,
                        });
                        await waitForTransactionReceipt(config, {
                            hash,
                        });
                        return hash;
                    default:
                        throw new Error(`Method ${requestArguments.method} is not supported`);
                }
            };
            return (await sendRequest()) as T;
        },
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
