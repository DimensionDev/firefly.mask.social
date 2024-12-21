import { FileMimeType } from '@/constants/enum.js';

function fetchImage(url: string, cors?: boolean): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        if (cors) img.crossOrigin = 'anonymous';

        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error('Failed to fetch image from URL'));
        };
        img.src = url;
    });
}

async function drawImageOnCanvas(img: HTMLImageElement) {
    return new Promise<Blob>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to create canvas context');

        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to convert image to PNG'));
            }
        }, FileMimeType.PNG);
    });
}

export async function fetchImageAsPNG(url: string, cors?: boolean): Promise<Blob> {
    const img = await fetchImage(url, cors);
    return drawImageOnCanvas(img);
}
