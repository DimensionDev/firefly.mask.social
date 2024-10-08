import type { UploadMediaV1Params } from 'twitter-api-v2';

import { MAX_SIZE_PER_CHUNK } from '@/constants/index.js';
import { getVideoDuration } from '@/helpers/getVideoDuration.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import { uploadToTwitterWithChunks } from '@/services/uploadToTwitterWithChunks.js';
import type { UploadMediaResponse } from '@/types/twitter.js';

export interface TwitterMediaResponse {
    file: File;
    media_id: string;
    media_id_string: string;
}

export async function uploadToTwitter(
    uploads: Array<{ file: File; options?: Partial<UploadMediaV1Params> }>,
): Promise<TwitterMediaResponse[]> {
    const medias = await Promise.all(
        uploads.map(({ file, options = {} }) => {
            if (file.size > MAX_SIZE_PER_CHUNK) {
                return uploadToTwitterWithChunks(file, undefined, options);
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('options', JSON.stringify(options));

            return twitterSessionHolder.fetch<{ data: UploadMediaResponse }>('/api/twitter/uploadMedia', {
                method: 'POST',
                body: formData,
            });
        }),
    );
    return medias.map((x, i) => ({
        file: uploads[i].file,
        media_id: x.data.media_id,
        media_id_string: x.data.media_id_string,
    }));
}

export async function uploadVideoToTwitter(file: File): Promise<TwitterMediaResponse[]> {
    const duration = await getVideoDuration(file);

    return uploadToTwitter([{ file, options: { longVideo: duration > 140 } }]);
}
