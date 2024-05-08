import { AbortError } from '@/constants/error.js';

export function isAbortedError(error: unknown) {
    return error instanceof AbortError || (error instanceof DOMException && error.name === 'AbortError');
}
