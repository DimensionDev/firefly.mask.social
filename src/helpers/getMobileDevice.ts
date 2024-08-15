import { bom } from '@/helpers/bom.js';

/**
 * Determine the mobile operating system.
 */
export function getMobileDevice() {
    if (!bom.window || !bom.navigator) return 'unknown';

    const userAgent = bom.navigator.userAgent || bom.navigator.vendor || bom.window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return 'Windows Phone';
    }

    if (/android/i.test(userAgent)) {
        return 'Android';
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !bom.window.MSStream) {
        return 'iOS';
    }

    return 'unknown';
}
