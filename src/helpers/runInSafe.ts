export function runInSafe<T>(fn: () => T, noThrow = true) {
    try {
        return fn();
    } catch (error) {
        if (noThrow) console.error(`[runInSafe] ${error}`);
        else throw error;
        return;
    }
}

export async function runInSafeAsync<T>(fn: () => Promise<T>, noThrow = true) {
    try {
        return await fn();
    } catch (error) {
        if (noThrow) console.error(`[runInSafeAsync] ${error}`);
        else throw error;
        return;
    }
}
