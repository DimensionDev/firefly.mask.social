import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';
import type { Address, Hex } from 'viem';
import { sendTransaction, waitForTransactionReceipt } from 'wagmi/actions';

import { getMintButtonText } from '@/components/NFTs/FreeMintButton.js';
import { config } from '@/configs/wagmiClient.js';
import { MintStatus } from '@/constants/enum.js';
import { enqueueMessageFromError, enqueueSuccessMessage, enqueueWarningMessage } from '@/helpers/enqueueMessage.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { SponsorMintOptions } from '@/providers/types/Firefly.js';

export function useSponsorMintNFT(mintTarget: SponsorMintOptions, mintCount: number, onSuccess?: () => void) {
    return useAsyncFn(async () => {
        try {
            const options = {
                walletAddress: mintTarget.walletAddress,
                contractAddress: mintTarget.contractAddress,
                tokenId: mintTarget.tokenId,
                chainId: mintTarget.chainId,
                buyCount: mintCount,
            };
            const latestParams = await FireflyEndpointProvider.getSponsorMintStatus(options);
            const mintStatus = latestParams.mintStatus;
            if (mintStatus === MintStatus.NotSupportted) {
                enqueueWarningMessage(t`So sorry, we are not able to mint this NFT at the moment.`);
                return;
            }
            if (![MintStatus.Mintable, MintStatus.MintAgain].includes(mintStatus)) {
                enqueueWarningMessage(
                    t`So sorry, we cant mint this NFT with the current status: ${getMintButtonText(true, true, mintStatus)}`,
                );
                return;
            }

            if (latestParams.gasStatus) {
                const result = await FireflyEndpointProvider.mintNFTBySponsor(options);
                if (!result.status) {
                    throw new Error(t`Mint failed`);
                }
            } else {
                const hash = await sendTransaction(config, {
                    data: latestParams.txData.inputData as Hex,
                    to: latestParams.txData.to as Address,
                    value: BigInt(latestParams.txData.value),
                });
                await waitForTransactionReceipt(config, { hash });
            }

            enqueueSuccessMessage(t`NFT minted successfully!`);
            onSuccess?.();
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to mint NFT.`);
            throw error;
        }
    }, [
        mintTarget.walletAddress,
        mintTarget.contractAddress,
        mintTarget.tokenId,
        mintTarget.chainId,
        mintCount,
        onSuccess,
    ]);
}
