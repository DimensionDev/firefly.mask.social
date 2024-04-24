interface Window {
    opera: string;
    MSStream: string;
}

/**
 * Determine the mobile operating system.
 */
export function getMobileDevice() {
    if (typeof window === 'undefined') return 'unknown';
    if (typeof navigator === 'undefined') return 'unknown';

    const win = window as unknown as Window;
    const userAgent = navigator.userAgent || navigator.vendor || win.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return 'Windows Phone';
    }

    if (/android/i.test(userAgent)) {
        return 'Android';
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !win.MSStream) {
        return 'iOS';
    }

    return 'unknown';
}
