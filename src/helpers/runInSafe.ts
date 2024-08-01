export async function runInSafe<T>(fn: () => Promise<T>, noThrow = true) {
    try {
        await fn();
    } catch (error) {
        if (!noThrow) throw error;
    }
}
