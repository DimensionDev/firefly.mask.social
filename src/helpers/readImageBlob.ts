function untilImageLoaded(img: HTMLImageElement) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        if (img.complete) {
            resolve(img);
        } else {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
        }
    });
}

/**
 * Read an image blob from an image element
 * @param img
 * @returns
 */
export async function readImageBlob(img: HTMLImageElement, mimeType = 'image/jpeg') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.display = 'none';

    try {
        await untilImageLoaded(img);

        document.body.appendChild(canvas);
        ctx.drawImage(img, 0, 0);

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, mimeType, 1);
        });
    } catch {
        return null;
    } finally {
        document.body.removeChild(canvas);
    }
}
