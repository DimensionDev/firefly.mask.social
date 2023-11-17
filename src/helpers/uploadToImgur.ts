interface UploadProgress {
    percent: number;
    transferred: number;
    total: number;
    id: string;
}

export function* uploadToImgur(
    file: File,
    metadata?: { title: string; description?: string },
): Generator<UploadProgress | string, string, boolean> {
    // Learn more:
    // https://www.npmjs.com/package/imgur
    // https://apidocs.imgur.com/

    // Your implementation for uploading progress and obtaining the complete URL goes here
    const progress: UploadProgress = {
        percent: 0,
        transferred: 0,
        total: 0,
        id: '',
    };

    // Simulate uploading progress until it reaches 100%
    while (progress.percent < 100) {
        progress.percent += 10;
        progress.transferred += 100;
        progress.total += 1000;

        // Yield the current progress information
        yield progress;
    }

    const completeUrl = 'https://example.com/complete'; // Replace with the actual complete URL

    // You can return additional information or perform cleanup if needed
    return completeUrl;
}
