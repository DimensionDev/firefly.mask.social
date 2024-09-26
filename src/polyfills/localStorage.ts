try {
    if (typeof window !== 'undefined') {
        if (!window.localStorage) {
            function createStorage() {
                const storage = new Map();
                return {
                    get length() {
                        return storage.size;
                    },
                    getItem(key: string) {
                        return storage.get(key);
                    },
                    setItem(key: string, value: string) {
                        return storage.set(key, value);
                    },
                    removeItem(key: string) {
                        return storage.delete(key);
                    },
                    key(index: number) {
                        return Array.from(storage.keys())[index];
                    },
                    clear() {
                        storage.clear();
                    },
                };
            }

            // for firefly android webview the localStorage is not writable
            Object.defineProperty(window, 'localStorage', {
                value: createStorage(),
                configurable: true,
                enumerable: true,
                writable: true,
            });
        }
    }
} catch (error) {
    console.error(`[polyfill localStorage]: ${error}`);
}
