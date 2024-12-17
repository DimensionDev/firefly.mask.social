import { type IStorageProvider, production } from '@lens-protocol/client';
import { ConnectorAccountNotFoundError } from 'wagmi';
import { getAccount, signMessage } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { bom } from '@/helpers/bom.js';
import { LocalStorageProvider, setLensCredentials } from '@/helpers/createLensSDK.js';
import { memoizePromise } from '@/helpers/memoizePromise.js';
import type { LensSession } from '@/providers/lens/Session.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

const dynamicLoad = memoizePromise(
    async () => {
        const gatedModule = await import('@lens-protocol/client/gated');
        return gatedModule.LensClient;
    },
    () => 'lens-protocol-client-gated',
);

export async function createLensGatedSDK(storage: IStorageProvider) {
    const GatedClient = await dynamicLoad();

    return new GatedClient({
        environment: production,
        storage,
        authentication: {
            domain: bom.location?.hostname ?? '',
            uri: bom.location?.href ?? '',
        },
        signer: {
            getAddress: async () => {
                const account = getAccount(config);
                if (!account.address) {
                    throw ConnectorAccountNotFoundError;
                }

                return account.address;
            },
            signMessage: async (message) => {
                return signMessage(config, {
                    message,
                });
            },
        },
    });
}

export function createLensGatedSDKWithSession() {
    const session = useLensStateStore.getState().currentProfileSession;
    if (!session) {
        throw new Error('No Lens session found');
    }

    const storage = new LocalStorageProvider();
    setLensCredentials(storage, session as LensSession);
    return createLensGatedSDK(storage);
}
