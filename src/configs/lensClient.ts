import { type IStorageProvider, LensClient, production } from '@lens-protocol/client';

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

let client: LensClient;

export function createLensClient() {
    if (!client) {
        client = new LensClient({
            environment: production,
            storage: new LocalStorageProvider(),
        });
    }
    return client;
}
