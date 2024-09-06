import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { S3ConvertStatus, type SocialSourceInURL } from '@/constants/enum.js';
import { InvalidResultError, UnreachableError } from '@/constants/error.js';
import { parseURL } from '@/helpers/parseURL.js';
import { pollWithRetry } from '@/helpers/pollWithRetry.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { ConvertM3u8Response, ConvertM3u8StatusResponse } from '@/providers/types/Firefly.js';
import { uploadToS3 } from '@/services/uploadToS3.js';
import { settings } from '@/settings/index.js';

async function convertVideoToM3u8(s3Url: string, signal?: AbortSignal) {
    const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/convert');
    const response = await fireflySessionHolder.fetch<ConvertM3u8Response>(url, {
        method: 'POST',
        body: JSON.stringify({ file_path: s3Url }),
        signal,
    });

    return resolveFireflyResponseData(response);
}

async function waitForConvertJob(jobId: string, signal?: AbortSignal) {
    return pollWithRetry(
        async () => {
            const url = urlcat(settings.FIREFLY_ROOT_URL, '/v1/post/getconvertStatus', { jobID: jobId });
            const response = await fireflySessionHolder.fetch<ConvertM3u8StatusResponse>(url);
            const data = resolveFireflyResponseData(response);

            if (data.code) return;

            switch (data.status) {
                case S3ConvertStatus.Canceled:
                    throw new Error('Convert job canceled');
                case S3ConvertStatus.Error:
                    throw new Error('Convert job failed');
                case S3ConvertStatus.Complete:
                    return;
                case S3ConvertStatus.Progressing:
                case S3ConvertStatus.Submitted:
                case S3ConvertStatus.StatusUpdate:
                    throw new InvalidResultError();
                default:
                    safeUnreachable(data.status);
                    throw new UnreachableError('s3 convert job status', data.status);
            }
        },
        {
            times: Number.MAX_SAFE_INTEGER,
            interval: 2000,
            signal,
        },
    );
}

export async function uploadAndConvertToM3u8(file: File, source: SocialSourceInURL, signal?: AbortSignal) {
    const s3Url = await uploadToS3(file, source);

    const parsedUrl = parseURL(s3Url);
    if (!parsedUrl) throw new Error('Invalid s3 url');

    const { m3u8Url, jobId } = await convertVideoToM3u8(parsedUrl.pathname, signal);

    await waitForConvertJob(jobId, signal);

    return m3u8Url;
}
