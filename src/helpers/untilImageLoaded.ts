export function untilImageLoaded(img: HTMLImageElement) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        if (img.complete) {
            resolve(img);
        } else {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
        }
    });
}

export function untilImageUrlLoaded(imgUrl: string) {
    const image = new Image()
    image.src = imgUrl
    return untilImageLoaded(image)
}
