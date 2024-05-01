import { SourceInURL } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ResponseJSON } from '@/types/index.js';

type UploadS3Response = ResponseJSON<{ link: string }>;

export async function uploadToS3(file: File, source: SourceInURL): Promise<string> {
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
            throwIfNotOK: true,
            noDefaultContentType: true,
        },
    );
    if (!response.success) throw new Error(response.error.message);
    return response.data.link;
}
