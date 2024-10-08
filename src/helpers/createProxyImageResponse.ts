import { CACHE_AGE_INDEFINITE_ON_DISK } from '@/constants/index.js';
import { createErrorResponseJSON } from '@/helpers/createResponseJSON.js';

export async function createProxyImageResponse(url: string) {
    const response = await fetch(url);
    if (!response.ok) return createErrorResponseJSON('Unable to access the image');
    return new Response(response.body, {
        headers: {
            'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
            'Cache-Control': response.headers.get('cache-control') || CACHE_AGE_INDEFINITE_ON_DISK,
        },
    });
}
