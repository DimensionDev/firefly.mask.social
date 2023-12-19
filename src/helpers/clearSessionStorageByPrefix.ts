export function clearSessionStorageByPrefix(prefix: string): void {
    for (const key in sessionStorage) {
        if (Object.hasOwn(sessionStorage, key) && key.startsWith(prefix)) {
            sessionStorage.removeItem(key);
        }
    }
}
