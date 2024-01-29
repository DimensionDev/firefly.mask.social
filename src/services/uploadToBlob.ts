/* cspell:disable */

import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

import { KeyType } from '@/constants/enum.js';

export async function uploadToBlob(pathname: string, blob: Blob) {
    try {
        const url = await kv.hget(KeyType.UploadToBlob, pathname);
        if (typeof url === 'string' && URL.canParse(url)) return url;
    } catch {
        // Ignore
    }

    const response = await put(pathname, blob, {
        access: 'public',
    });

    try {
        await kv.hset(KeyType.UploadToBlob, {
            [pathname]: response.url,
        });
    } catch {
        // Ignore
    }

    return response.url;
}
