import { type IStorageProvider, LensClient as LensClientSDK, production } from '@lens-protocol/client';
import { LensClient as LensGatedClientSDK, production as gatedProduction } from '@lens-protocol/client/gated';
import { ConnectorNotConnectedError } from '@wagmi/core';
import { getAccount, signMessage } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { bom } from '@/helpers/bom.js';
import type { LensSession } from '@/providers/lens/Session.js';

export class LocalStorageProvider implements IStorageProvider {
    getItem(key: string) {
        return bom.localStorage?.getItem(key) ?? null;
    }

    setItem(key: string, value: string) {
        bom.localStorage?.setItem(key, value);
    }

    removeItem(key: string) {
        bom.localStorage?.removeItem(key);
    }
}

export class MemoryStorageProvider implements IStorageProvider {
    public storage = new Map<string, string>();

    getItem(key: string) {
        return this.storage.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        this.storage.set(key, value);
    }

    removeItem(key: string) {
        this.storage.delete(key);
    }
}

export function getLensCredentials(storage: IStorageProvider) {
    const item = storage.getItem('lens.production.credentials');
    return item as string | null;
}

export function setLensCredentials(storage: IStorageProvider, session: LensSession) {
    if (!session.refreshToken) throw new Error('No refresh token found in Lens session');
    const now = Date.now();

    storage.setItem(
        'lens.production.credentials',
        JSON.stringify({
            data: {
                refreshToken: session.refreshToken,
            },
            metadata: {
                createdAt: now,
                updatedAt: now,
                version: 2,
            },
        }),
    );
}

export function removeLensCredentials(storage: IStorageProvider) {
    storage.removeItem('lens.production.credentials');
}

export function createLensSDK(storage: IStorageProvider) {
    return new LensClientSDK({
        environment: production,
        storage,
    });
}

export function createLensSDKForSession(storage: IStorageProvider, session: LensSession) {
    setLensCredentials(storage, session);
    return createLensSDK(storage);
}

export function createLensGatedSDK(storage: IStorageProvider) {
    return new LensGatedClientSDK({
        environment: gatedProduction,
        storage,
        authentication: {
            domain: bom.window?.location.hostname || '',
            uri: bom.window?.location.href || '',
        },
        signer: {
            getAddress: async () => {
                const account = getAccount(config);
                if (!account.address) {
                    throw new ConnectorNotConnectedError();
                }

                return account.address;
            },
            signMessage: async (message: string) => {
                return signMessage(config, { message });
            },
        },
    });
}
