import { type IStorageProvider, LensClient as LensClientSDK, production } from '@lens-protocol/client';

const ls = typeof window === 'undefined' ? undefined : window.localStorage;

class LocalStorageProvider implements IStorageProvider {
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

class MemoryStorageProvider implements IStorageProvider {
    private storage = new Map<string, string>();

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

export function createLensSDK(persistent: boolean) {
    return new LensClientSDK({
        environment: production,
        storage: persistent ? new LocalStorageProvider() : new MemoryStorageProvider(),
    });
}
