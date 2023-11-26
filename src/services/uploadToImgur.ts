import { i18n } from '@lingui/core';

interface UploadProgress {
    percent: number;
    transferred: number;
    total: number;
    id: string;
}

export function uploadToImgur(
    file: File,
    metadata?: { title: string; description?: string },
    onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const clientId = process.env.IMGUR_CLIENT_ID;
        const formData = new FormData();
        formData.append('image', file);

        metadata?.title && formData.append('title', metadata.title);
        metadata?.description && formData.append('description', metadata.description);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.imgur.com/3/upload');
        xhr.setRequestHeader('Authorization', `Client-ID ${clientId}`);

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable && onProgress) {
                const progress: UploadProgress = {
                    percent: (event.loaded / event.total) * 100,
                    transferred: event.loaded,
                    total: event.total,
                    id: '',
                };
                onProgress(progress);
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const completeUrl = response.data.link;
                resolve(completeUrl);
            } else {
                reject(new Error(i18n.t('Upload failed')));
            }
        };

        xhr.send(formData);
    });
}
