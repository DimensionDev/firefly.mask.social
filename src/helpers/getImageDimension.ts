export interface ImageDimension {
    width: number;
    height: number;
}

export function getImageDimension(file: Blob | string): Promise<ImageDimension> {
    return new Promise<ImageDimension>((resolve, reject) => {
        const image = new Image();

        image.addEventListener(
            'load',
            () => {
                resolve({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                });
            },
            {
                once: true,
                signal: AbortSignal.timeout(60 * 1000),
            },
        );
        image.addEventListener(
            'error',
            () => {
                reject(new Error('Failed to load image.'));
            },
            {
                once: true,
                signal: AbortSignal.timeout(60 * 1000),
            },
        );
        image.src = typeof file === 'string' ? file : URL.createObjectURL(file);
    });
}
