try {
    if (typeof window !== 'undefined') {
        window.localStorage =
            window.localStorage ||
            (() => {
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
            })();
    }
} catch (error) {
    console.error(`[polyfill localStorage]: ${error}`);
}
