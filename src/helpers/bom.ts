export function getWindowSafe() {
    if (typeof window === 'undefined') return null;
    return window;
}

export function getDocumentSafe() {
    return getWindowSafe()?.document ?? null;
}

export function getLocationSafe() {
    return getWindowSafe()?.location ?? null;
}

export function getNavigatorSafe() {
    return getWindowSafe()?.navigator ?? null;
}
