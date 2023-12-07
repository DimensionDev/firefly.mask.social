import { type IStorageProvider, LensClient, production } from '@lens-protocol/client';

class LocalStorageProvider implements IStorageProvider {
    getItem(key: string) {
        return window.localStorage.getItem(key);
    }

    setItem(key: string, value: string) {
        window.localStorage.setItem(key, value);
    }

    removeItem(key: string) {
        window.localStorage.removeItem(key);
    }
}

export function createLensClient() {
    return new LensClient({
        environment: production,
        storage: new LocalStorageProvider(),
    });
}
