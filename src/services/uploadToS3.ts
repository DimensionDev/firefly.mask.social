import { type SocialSourceInURL } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ResponseJSON } from '@/types/index.js';

type UploadS3Response = ResponseJSON<{ link: string }>;

const uploadedCache = new WeakMap<File, string | Promise<string>>();

export async function uploadToS3(file: File, source: SocialSourceInURL): Promise<string> {
    const hit = uploadedCache.get(file);
    if (typeof hit === 'string' || hit instanceof Promise) return hit;
    const promise = new Promise<string>(async (resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source', source);

        const response = await fetchJSON<UploadS3Response>(
            '/api/s3',
            {
                method: 'PUT',
                body: formData,
            },
            {
                noDefaultContentType: true,
            },
        );
        if (!response.success) reject(new Error(response.error.message));
        else {
            uploadedCache.set(file, response.data.link);
            resolve(response.data.link);
        }
    });
    uploadedCache.set(file, promise);

    return promise;
}
