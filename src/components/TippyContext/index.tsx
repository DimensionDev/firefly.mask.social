import { createContext, useContext } from 'react';

export const TippyContext = createContext(false);

/**
 * To avoid infinite nested tippy, you should check if is inside tippy
 */
export function useTippyContext() {
    return useContext(TippyContext);
}
