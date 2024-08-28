import { ActionConfig as RawActionConfig, BlockchainIds } from '@dialectlabs/blinks';
import { t } from '@lingui/macro';
import type { ChainId } from '@masknet/web3-shared-evm';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { pick } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { type Hex, isHex, parseTransaction } from 'viem';
import { useAccount, useSendTransaction } from 'wagmi';

import { chains } from '@/configs/wagmiClient.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { resolveEvmCAIP2 } from '@/helpers/resolveEvmCAIP2.js';
import { switchEthereumChain } from '@/helpers/switchEthereumChain.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { ConnectModalRef } from '@/modals/controls.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';

class ActionConfig extends RawActionConfig {
    override async confirmTransaction(signature: string) {
        const signatureJSON = parseJSON(signature) as { txHash: string; chainId: ChainId } | null;
        if (signatureJSON && signatureJSON.chainId && isHex(signatureJSON.txHash)) {
            await waitForEthereumTransaction(signatureJSON.chainId, signatureJSON.txHash);
            return;
        }
        return super.confirmTransaction(signature);
    }
}

export function useActionAdapter() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();
    const { sendTransactionAsync } = useSendTransaction();
    const evmAccount = useAccount();

    const signEvmTransaction = useCallback(
        async (txData: Hex) => {
            try {
                if (!evmAccount?.address) {
                    ConnectModalRef.open();
                    return;
                }
                const { chainId, ...parsedTransaction } = parseTransaction(txData);
                if (chainId !== EthereumNetwork.getChainId()) {
                    await switchEthereumChain(chainId as ChainId);
                }
                const txHash = await sendTransactionAsync(pick(parsedTransaction, 'data', 'to', 'value', 'type'));
                return {
                    signature: JSON.stringify({ txHash, chainId }),
                };
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Signing failed.`));
                return { error: t`Signing failed.` };
            }
        },
        [evmAccount?.address, sendTransactionAsync],
    );

    const signSolanaTransaction = useCallback(
        async (txData: string) => {
            try {
                const tx = await wallet.sendTransaction(
                    VersionedTransaction.deserialize(Buffer.from(txData, 'base64')),
                    connection,
                );
                return { signature: tx };
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Signing failed.`));
                return { error: t`Signing failed.` };
            }
        },
        [connection, wallet],
    );

    return useMemo(() => {
        return new ActionConfig(connection, {
            metadata: {
                supportedBlockchainIds: [
                    BlockchainIds.ETHEREUM_MAINNET,
                    BlockchainIds.SOLANA_MAINNET,
                    BlockchainIds.SOLANA_TESTNET,
                    BlockchainIds.SOLANA_DEVNET,
                    ...chains.map((x) => resolveEvmCAIP2(x.id as ChainId)),
                ],
            },
            connect: async () => {
                try {
                    await wallet.connect();
                } catch {
                    walletModal.setVisible(true);
                    return null;
                }
                return wallet.publicKey?.toBase58() ?? null;
            },
            signTransaction: async (txData: string) => {
                if (isHex(txData)) {
                    return (await signEvmTransaction(txData))!;
                }
                return signSolanaTransaction(txData);
            },
        });
    }, [connection, signEvmTransaction, signSolanaTransaction, wallet, walletModal]);
}
