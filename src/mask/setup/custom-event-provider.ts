import {
    ChainId,
    EthereumMethodType,
    isValidAddress,
    isValidChainId,
    type RequestArguments,
} from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import { hexToBigInt, hexToNumber, numberToHex } from 'viem';
import { getAccount, sendTransaction, signMessage, switchNetwork } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { ConnectWalletModalRef } from '@/modals/controls.js';

function getConnectedAccount() {
    const account = getAccount(config);
    if (account.isConnected && !account.isConnecting) return account;
    return null;
}

// @ts-expect-error TODO: define the custom event
document.addEventListener(
    'mask_custom_event_provider_request',
    async (event: CustomEvent<{ id: string; requestArguments: RequestArguments }>) => {
        const { id, requestArguments } = event.detail;
        console.info('[custom-event-provider] request:', requestArguments);

        const dispatchEvent = (result: unknown, error?: Error) => {
            if (error) console.info(`[custom-event-provider] response error: ${error}`);
            else console.info(`[custom-event-provider] response result: ${result}`);
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
                    const accountFirstTry = getConnectedAccount();
                    if (!accountFirstTry?.isConnected) await ConnectWalletModalRef.openAndWaitForClose();

                    const accountSecondTry = getConnectedAccount();
                    if (!accountSecondTry?.isConnected) dispatchEvent([], new Error('No wallet connected'));
                    else dispatchEvent(accountSecondTry.address ? [accountSecondTry.address] : []);
                    return;
                }
                case EthereumMethodType.ETH_ACCOUNTS: {
                    const account = getConnectedAccount();
                    dispatchEvent(isValidAddress(account?.address) ? [account.address] : []);
                    return;
                }
                case EthereumMethodType.ETH_CHAIN_ID: {
                    const account = getConnectedAccount();
                    dispatchEvent(account?.chain ? numberToHex(account.chain.id) : ChainId.Mainnet);
                    return;
                }
                case EthereumMethodType.PERSONAL_SIGN: {
                    const signature = await signMessage(config, {
                        message: requestArguments.params[0],
                    });
                    dispatchEvent(signature);
                    return;
                }
                case EthereumMethodType.ETH_SEND_TRANSACTION: {
                    const transactionConfig = requestArguments.params[0];
                    const hash = await sendTransaction(config, {
                        ...transactionConfig,
                        gas: hexToBigInt(transactionConfig.gas),
                        gasPrice: transactionConfig.gasPrice ? hexToBigInt(transactionConfig.gasPrice) : undefined,
                        maxFeePerGas: transactionConfig.maxFeePerGas
                            ? hexToBigInt(transactionConfig.maxFeePerGas)
                            : undefined,
                        maxPriorityFeePerGas: transactionConfig.maxPriorityFeePerGas
                            ? hexToBigInt(transactionConfig.maxPriorityFeePerGas)
                            : undefined,
                    });
                    dispatchEvent(hash);
                    return;
                }
                case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
                    const chainId = requestArguments.params[0].chainId;
                    if (isValidChainId(hexToNumber(chainId))) {
                        await switchNetwork(config, {
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

config.subscribe(
    (s) => s,
    (state, previousState) => {
        const dispatchEvent = (type: string, payload?: unknown) => {
            console.info(`[custom-event-provider] ${type}`, payload);
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

        const account = state.current ? first(state.connections.get(state.current)?.accounts) : undefined;
        const previousAccount = previousState.current
            ? first(previousState.connections.get(previousState.current)?.accounts)
            : undefined;
        const chainId = state.chainId;
        const previousChainId = previousState.chainId;

        if (
            state.status === 'connected' &&
            account &&
            previousAccount &&
            chainId &&
            previousChainId &&
            isSameEthereumAddress(account, previousAccount) &&
            chainId !== previousChainId
        ) {
            dispatchEvent('chainChanged', numberToHex(chainId));
            return;
        }

        if (
            state.status === 'connected' &&
            account &&
            previousAccount &&
            chainId &&
            previousChainId &&
            !isSameEthereumAddress(account, previousAccount) &&
            chainId === previousChainId
        ) {
            dispatchEvent('accountsChanged', [account]);
            return;
        }

        if (state.status === 'connected' && account && chainId) {
            dispatchEvent('connect', {
                account,
                chainId,
            });
            return;
        }
    },
);
