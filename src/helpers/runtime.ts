/**
 * Learn more about nextjs runtime difference:
 * https://nextjs.org/docs/pages/building-your-application/rendering/edge-and-nodejs-runtimes
 */
export enum Runtime {
    Browser = 'browser',
    NodeJS = 'nodejs',
    Edge = 'edge',
    Serverless = 'serverless',
}

export function getRuntime() {
    if (typeof document !== 'undefined') return Runtime.Browser;
    // TODO: Check if it's serverless or Edge runtime
    return Runtime.NodeJS;
}

/**
 * To throw an error if the runtime is not the expected runtime.
 * @param runtime
 */
export function expectRuntime(runtime: Runtime) {
    if (getRuntime() !== runtime) {
        throw new Error(`Expected runtime to be ${runtime}`);
    }
}

/**
 * To log a warning if the runtime is not the expected runtime.
 * @param runtime
 */
export function safeExpectRuntime(runtime: Runtime) {
    if (getRuntime() !== runtime) {
        console.warn(`Expected runtime to be ${runtime}`);
    }
}
