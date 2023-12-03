import { createContext, useContext } from 'react';

/**
 * the `usehooks-ts useDarkMode` has a dependency on useMediaQuery.
 * useMediaQuery listens for an event when the component is registered.
 * When the system theme mode changes, these listeners are triggered and will cause a lot of re-rendering.
 */
export const DarkModeContext = createContext<{ isDarkMode: boolean }>({
    isDarkMode: false,
});

export function useDarkMode() {
    return useContext(DarkModeContext);
}
