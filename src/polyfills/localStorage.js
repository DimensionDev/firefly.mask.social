try {
    if (typeof window !== 'undefined') {
        if (!window.localStorage) {
            console.info('[polyfill localStorage]: created');

            function createStorage() {
                const storage = new Map();
                return {
                    get length() {
                        return storage.size;
                    },
                    getItem(key) {
                        return storage.get(key);
                    },
                    setItem(key, value) {
                        return storage.set(key, value);
                    },
                    removeItem(key) {
                        return storage.delete(key);
                    },
                    key(index) {
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
