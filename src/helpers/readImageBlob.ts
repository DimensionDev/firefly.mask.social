/**
 * Read an image blob from an image element
 * @param img
 * @returns
 */
export async function readImageBlob(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.display = 'none';

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    try {
        document.body.appendChild(canvas);
        ctx.drawImage(img, 0, 0);

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 1);
        });
    } catch {
        return null;
    } finally {
        document.body.removeChild(canvas);
    }
}
