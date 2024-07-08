import { type IStorageProvider, LensClient as LensClientSDK, production } from '@lens-protocol/client';

import type { LensSession } from '@/providers/lens/Session.js';

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

const ls = typeof window === 'undefined' ? undefined : window.localStorage;

export class LocalStorageProvider implements IStorageProvider {
    getItem(key: string) {
        return ls?.getItem(key) ?? null;
    }

    setItem(key: string, value: string) {
        ls?.setItem(key, value);
    }

    removeItem(key: string) {
        ls?.removeItem(key);
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
