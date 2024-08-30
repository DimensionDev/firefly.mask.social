import type { TypedDataDomain } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { createLensSDKForSession, MemoryStorageProvider } from '@/helpers/createLensSDK.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import type { LensSession } from '@/providers/lens/Session.js';

export async function updateSignless(enable: boolean, session: LensSession): Promise<void> {
    const sdk = createLensSDKForSession(new MemoryStorageProvider(), session);
    const typedDataResult = await sdk.profile.createChangeProfileManagersTypedData({
        approveSignless: enable,
    });

    const { id, typedData } = typedDataResult.unwrap();
    const walletClient = await getWalletClientRequired(config);
    const signedTypedData = await walletClient.signTypedData({
        domain: typedData.domain as TypedDataDomain,
        types: typedData.types,
        primaryType: 'ChangeDelegatedExecutorsConfig',
        message: typedData.value,
    });

    const broadcastOnchainResult = await sdk.transaction.broadcastOnchain({
        id,
        signature: signedTypedData,
    });

    const onchainRelayResult = broadcastOnchainResult.unwrap();

    if (onchainRelayResult.__typename === 'RelayError') {
        // TODO: read error message from onchainRelayResult and show it to user
        console.warn("Couldn't update signless", onchainRelayResult);
        throw new Error("Couldn't update signless");
    }

    if (onchainRelayResult.txHash)
        await sdk.transaction.waitUntilComplete({
            forTxHash: onchainRelayResult.txHash,
        });

    return;
}
