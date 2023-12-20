import { isSameAddress } from '@masknet/web3-shared-base';
import { ChainId, EthereumMethodType, isValidChainId, type RequestArguments } from '@masknet/web3-shared-evm';
import { hexToBigInt, hexToNumber, numberToHex } from 'viem';
import { getAccount, getNetwork, sendTransaction, signMessage, switchNetwork } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';

// @ts-expect-error TODO: define the custom event
document.addEventListener(
    'mask_custom_event_provider_request',
    async (event: CustomEvent<{ id: string; requestArguments: RequestArguments }>) => {
        const { id, requestArguments } = event.detail;
        console.warn('[wagmi] request:', requestArguments);

        const dispatchEvent = (result: unknown, error?: Error) => {
            if (error) console.warn(`[wagmi] response error: ${error}`);
            else console.warn(`[wagmi] response result: ${result}`);
            document.dispatchEvent(
                new CustomEvent('mask_custom_event_provider_response', {
                    detail: {
                        id,
                        result,
                        error,
                    },
                }),
            );
        };

        try {
            switch (requestArguments.method) {
                case EthereumMethodType.ETH_REQUEST_ACCOUNTS: {
                    const accountFirstTry = getAccount();
                    if (!accountFirstTry.isConnected) await ConnectWalletModalRef.openAndWaitForClose();

                    const accountSecondTry = getAccount();
                    if (!accountSecondTry.isConnected) dispatchEvent([], new Error('No wallet connected'));
                    else dispatchEvent(accountSecondTry.address ? [accountSecondTry.address] : []);
                    return;
                }
                case EthereumMethodType.ETH_ACCOUNTS: {
                    const account = getAccount();
                    dispatchEvent(account.address ? [account.address] : []);
                    return;
                }
                case EthereumMethodType.ETH_CHAIN_ID: {
                    const network = getNetwork();
                    dispatchEvent(network.chain ? numberToHex(network.chain.id) : ChainId.Mainnet);
                    return;
                }
                case EthereumMethodType.PERSONAL_SIGN: {
                    const signature = await signMessage({
                        message: requestArguments.params[0],
                    });
                    dispatchEvent(signature);
                    return;
                }
                case EthereumMethodType.ETH_SEND_TRANSACTION: {
                    const config = requestArguments.params[0];
                    const { hash } = await sendTransaction({
                        ...config,
                        gas: hexToBigInt(config.gas),
                        gasPrice: config.gasPrice ? hexToBigInt(config.gasPrice) : undefined,
                        maxFeePerGas: config.maxFeePerGas ? hexToBigInt(config.maxFeePerGas) : undefined,
                        maxPriorityFeePerGas: config.maxPriorityFeePerGas
                            ? hexToBigInt(config.maxPriorityFeePerGas)
                            : undefined,
                    });
                    dispatchEvent(hash);
                    return;
                }
                case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                    const chainId = requestArguments.params[0].chainId;
                    if (isValidChainId(hexToNumber(chainId))) {
                        await switchNetwork({
                            chainId: hexToNumber(chainId),
                        });
                        dispatchEvent(undefined);
                    } else {
                        dispatchEvent(undefined, new Error(`Invalid chainId: ${chainId}`));
                    }
                    return;
                default:
                    dispatchEvent(undefined, new Error(`Unsupported method: ${requestArguments.method}`));
                    return;
            }
        } catch (error) {
            dispatchEvent(undefined, error instanceof Error ? error : new Error('Failed to execute request'));
            return;
        }
    },
);

config.subscribe((state, previousState) => {
    const dispatchEvent = (type: string, payload?: unknown) => {
        console.warn(`[wagmi] ${type}`, payload);
        document.dispatchEvent(
            new CustomEvent('mask_custom_event_provider_event', {
                detail: {
                    type,
                    payload,
                },
            }),
        );
    };
    if (state.status === 'disconnected' && previousState.status === 'connected') {
        dispatchEvent('disconnect');
        return;
    }

    if (
        state.status === 'connected' &&
        state.data?.account &&
        previousState.data?.account &&
        state.data.chain?.id &&
        previousState.data.chain?.id &&
        isSameAddress(state.data.account, previousState.data?.account) &&
        state.data.chain.id !== previousState.data?.chain.id
    ) {
        dispatchEvent('chainChanged', numberToHex(state.data.chain.id));
        return;
    }

    if (
        state.status === 'connected' &&
        state.data?.account &&
        previousState.data?.account &&
        state.data.chain?.id &&
        previousState.data.chain?.id &&
        !isSameAddress(state.data.account, previousState.data.account) &&
        state.data.chain.id === previousState.data.chain.id
    ) {
        dispatchEvent('accountsChanged', [state.data.account]);
        return;
    }

    if (state.status === 'connected' && state.data?.account && state.data.chain?.id) {
        dispatchEvent('connect', {
            account: state.data.account,
            chainId: state.data.chain.id,
        });
        return;
    }
});
