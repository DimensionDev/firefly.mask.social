import { fetchArrayBuffer } from '@/helpers/fetchArrayBuffer.js';
import type { NextFetchersOptions } from '@/helpers/getNextFetchers.js';

/**
 * S3 cached some assets before CORS response headers are set
 * for those cached assets, S3 responses w/o CORS headers
 * so we need to add no-cache headers to bypass the cache
 * @param originUrl
 * @returns
 */
export function fetchArrayBufferS3(originUrl: string, init?: RequestInit, options?: NextFetchersOptions) {
    const u = new URL(originUrl);
    const isS3 = u.host === 's3.amazonaws.com';
    if (isS3) u.searchParams.set('new-cache', '');

    // cached image stored on s3 could cause cors error
    const headers = isS3 ? { pragma: 'no-cache', 'cache-control': 'no-cache' } : undefined;
    return fetchArrayBuffer(u, {
        headers,
    });
}
