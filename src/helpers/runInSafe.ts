export function runInSafe<T>(fn: () => T, noThrow = true, defaultValue?: T) {
    try {
        return fn();
    } catch (error) {
        if (!noThrow) throw error;
        console.error(`[runInSafe] ${error}`);
        return defaultValue;
    }
}

export async function runInSafeAsync<T>(fn: () => Promise<T>, noThrow = true) {
    try {
        return await fn();
    } catch (error) {
        if (!noThrow) throw error;
        console.error(`[runInSafeAsync] ${error}`);
        return;
    }
}
