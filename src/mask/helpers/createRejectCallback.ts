export function createRejectCallback(methodName: string) {
    return (): Promise<never> => {
        throw new Error(`Not implemented - ${methodName}`);
    };
}
