import type { SocialPlatform } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { ResponseJSON } from '@/types/index.js';

export async function uploadToS3(file: File, source: SocialPlatform): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);
    const response = await fetchJSON<ResponseJSON<{ link: string }>>(
        '/api/s3',
        {
            method: 'PUT',
            body: formData,
        },
        {
            noDefaultContentType: true,
        },
    );
    if (!response.success) throw new Error(response.error.message);
    return response.data.link;
}
