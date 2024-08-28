import { delay } from '@masknet/kit';
import urlcat from 'urlcat';

import { UploadMediaStatus } from '@/constants/enum.js';
import { TimeoutError, UnreachableError } from '@/constants/error.js';
import { MAX_SIZE_PER_CHUNK } from '@/constants/index.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { GetUploadStatusResponse, UploadMediaResponse } from '@/types/twitter.js';

async function waitForUpload(media_id: string, retry = 10) {
    const { data } = await twitterSessionHolder.fetch<{ data: GetUploadStatusResponse }>(
        urlcat('/api/twitter/uploadMedia/chunk', { media_id }),
    );

    switch (data.processing_info?.state) {
        case UploadMediaStatus.Failed:
            throw new Error(data.processing_info.error?.message || 'Failed to upload on X');
        case UploadMediaStatus.Success:
            return data;
        case UploadMediaStatus.Pending:
        case UploadMediaStatus.Uploading:
            if (retry <= 0) {
                throw new TimeoutError('Timeout waiting for upload');
            }
            await delay(1000);
            return waitForUpload(media_id, retry - 1);
        default:
            throw new UnreachableError('UploadMediaStatus', data.processing_info?.state);
    }
}

export async function uploadToTwitterWithChunks(file: File, chunkSize = MAX_SIZE_PER_CHUNK) {
    const chunks = [];
    for (let i = 0; i < file.size; i += chunkSize) {
        chunks.push(file.slice(i, i + chunkSize));
    }

    // Init upload
    const mediaInfo = await twitterSessionHolder.fetch<{ data: UploadMediaResponse }>(
        urlcat('/api/twitter/uploadMedia/chunk/init', {
            total_bytes: file.size,
            media_type: file.type,
            media_category: file.type === 'video/mp4' ? 'tweet_video' : undefined,
        }),
        { method: 'POST' },
    );

    // upload chunks
    await Promise.all(
        chunks.map(async (chunk, index) => {
            const formData = new FormData();
            formData.append('media', chunk);

            return twitterSessionHolder.fetch(
                urlcat('/api/twitter/uploadMedia/chunk/append', {
                    media_id: mediaInfo.data.media_id,
                    segment_index: index,
                }),
                {
                    method: 'POST',
                    body: formData,
                },
            );
        }),
    );

    // Finish upload
    await twitterSessionHolder.fetch(
        urlcat('/api/twitter/uploadMedia/chunk', {
            media_id: mediaInfo.data.media_id,
        }),
        { method: 'POST' },
    );

    // Confirm upload
    await waitForUpload(mediaInfo.data.media_id);

    return mediaInfo;
}
