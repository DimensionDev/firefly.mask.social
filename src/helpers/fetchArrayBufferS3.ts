import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';

/**
 * S3 incorrectly cached assets before CORS response headers are set
 * so we need to add no-cache headers to bypass the cache
 * @param originUrl
 * @returns
 */
export function fetchArrayBufferS3(originUrl: string) {
    const isS3 = new URL(originUrl).host === 's3.amazonaws.com';
    const url = isS3 && !originUrl.includes('?') ? `${originUrl}?new-cache` : originUrl;

    // cached image stored on s3 could cause cors error
    const headers = url === originUrl && isS3 ? { pragma: 'no-cache', 'cache-control': 'no-cache' } : undefined;
    return fetchArrayBuffer(url, {
        headers,
    });
}
