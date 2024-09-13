import { delay, safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { S3ConvertStatus, type SocialSourceInURL } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { getVideoMetadata } from '@/helpers/getVideoMetadata.js';
import { parseURL } from '@/helpers/parseURL.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { ConvertM3u8Response, ConvertM3u8StatusResponse } from '@/providers/types/Firefly.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { settings } from '@/settings/index.js';

async function convertVideoToM3u8(s3Url: string, width: number, height: number, signal?: AbortSignal) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/convert', {
        width,
        height,
    });
    const response = await fireflySessionHolder.fetch<ConvertM3u8Response>(url, {
        method: 'POST',
        body: JSON.stringify({ file_path: s3Url }),
        signal,
    });

    return resolveFireflyResponseData(response);
}

async function waitForConvertJob(jobId: string, signal?: AbortSignal) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/getconvertStatus', { jobID: jobId });
    const response = await fireflySessionHolder.fetch<ConvertM3u8StatusResponse>(url, { signal });
    const data = resolveFireflyResponseData(response);

    if (data.code) return;

    switch (data.status) {
        case S3ConvertStatus.Submitted:
        case S3ConvertStatus.Complete:
        case S3ConvertStatus.Progressing:
            return;
        case S3ConvertStatus.Canceled:
        case S3ConvertStatus.Error:
        case S3ConvertStatus.StatusUpdate:
            throw new Error('Convert job failed');
        default:
            safeUnreachable(data.status);
            throw new UnreachableError('s3 convert job status', data.status);
    }
}

export async function uploadAndConvertToM3u8(file: File, source: SocialSourceInURL, signal?: AbortSignal) {
    const s3Url = await uploadToS3(file, source);

    const parsedUrl = parseURL(s3Url);
    if (!parsedUrl) throw new Error('Invalid s3 url');

    const { width, height } = await getVideoMetadata(file);
    const { m3u8Url, jobId } = await convertVideoToM3u8(parsedUrl.pathname, width, height, signal);

    await delay(1500);
    await waitForConvertJob(jobId, signal);

    return m3u8Url;
}
