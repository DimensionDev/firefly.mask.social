import { type IStorageProvider, LensClient as LensClientSDK, production } from '@lens-protocol/client';

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
