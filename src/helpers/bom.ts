export function getWindowSafe() {
    if (typeof window === 'undefined') return null;
    return window;
}

export function getLocationSafe() {
    return getWindowSafe()?.location;
}

export function getNavigatorSafe() {
    return getWindowSafe()?.navigator;
}
