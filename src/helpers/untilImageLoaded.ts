import { AbortError } from '@/constants/error.js';

export function untilImageLoaded(img: HTMLImageElement, signal?: AbortSignal) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const onAbort = () => {
            reject(new AbortError());
            cleanup();
        };

        const cleanup = () => {
            signal?.removeEventListener('abort', onAbort);
            img.onload = null;
            img.onerror = null;
        };

        if (img.complete) {
            resolve(img);
            return;
        }

        if (signal?.aborted) {
            onAbort();
            return;
        }

        signal?.addEventListener('abort', onAbort);

        img.onload = () => {
            cleanup();
            resolve(img);
        };
        img.onerror = () => {
            cleanup();
            reject(new Error('Failed to load image'));
        };
    });
}

export function untilImageUrlLoaded(imgUrl: string, signal?: AbortSignal) {
    const image = new Image();
    image.src = imgUrl;
    return untilImageLoaded(image, signal);
}
